// src/stores/messageBox.ts
import { defineStore } from 'pinia'

export type MessageBoxVariant = 'alert' | 'confirm'

interface MessageBoxOptions {
  isOpen: boolean
  variant: MessageBoxVariant
  title: string
  message: string
  confirmButtonText: string
  cancelButtonText: string
  okButtonText: string
  hideCloseButton: boolean
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
  onOk: (() => void) | null
  _resolvePromise: ((value: boolean | PromiseLike<boolean>) => void) | null // For promise-based usage
}

const defaultState: MessageBoxOptions = {
  isOpen: false,
  variant: 'alert',
  title: '',
  message: '',
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
  okButtonText: 'OK',
  hideCloseButton: false,
  onConfirm: null,
  onCancel: null,
  onOk: null,
  _resolvePromise: null,
}

export const useMessageBoxStore = defineStore('messageBox', {
  state: (): MessageBoxOptions => ({ ...defaultState }),

  actions: {
    open(options: Partial<Omit<MessageBoxOptions, 'isOpen' | '_resolvePromise'>>) {
      // Merge options with defaults
      this.$patch({
        ...defaultState, // Reset to defaults first
        ...options, // Apply new options
        isOpen: true,
        _resolvePromise: null, // Reset promise resolver initially
      })
    },

    // For promise-based confirmation
    confirm(
      options: Partial<Omit<MessageBoxOptions, 'isOpen' | 'variant' | '_resolvePromise'>>,
    ): Promise<boolean> {
      return new Promise((resolve) => {
        this.$patch({
          ...defaultState,
          ...options,
          variant: 'confirm',
          isOpen: true,
          _resolvePromise: resolve, // Store the resolver
          // Callbacks will now use the promise resolver
          onConfirm: () => {
            if (this._resolvePromise) this._resolvePromise(true)
            this.close()
            if (options.onConfirm) options.onConfirm() // Call original if provided
          },
          onCancel: () => {
            if (this._resolvePromise) this._resolvePromise(false)
            this.close()
            if (options.onCancel) options.onCancel() // Call original if provided
          },
        })
      })
    },

    alert(options: Partial<Omit<MessageBoxOptions, 'isOpen' | 'variant' | '_resolvePromise'>>) {
      this.open({ ...options, variant: 'alert' })
    },

    handleConfirm() {
      if (this.onConfirm) this.onConfirm()
      if (this._resolvePromise) this._resolvePromise(true)
      this.close()
    },

    handleCancel() {
      if (this.onCancel) this.onCancel()
      if (this._resolvePromise) this._resolvePromise(false)
      this.close()
    },

    handleOk() {
      if (this.onOk) this.onOk()
      // No promise for simple alert dismissal via OK
      this.close()
    },

    close() {
      // If a promise was waiting and wasn't resolved by confirm/cancel, resolve it as false (dismissal)
      if (this.variant === 'confirm' && this._resolvePromise && this.isOpen) {
        this._resolvePromise(false)
      }
      this.$reset() // Resets state to its initial value (defined by defaultState)
    },
  },
})
