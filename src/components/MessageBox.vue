<template>
  <teleport to="body">
    <transition name="messagebox-fade">
      <div v-if="store.isOpen" class="messagebox-overlay" @click.self="handleOverlayClick" role="presentation">
        <div
          class="messagebox-container"
          role="dialog"
          :aria-labelledby="store.title ? 'messagebox-title' : undefined"
          :aria-describedby="'messagebox-message'"
          aria-modal="true"
          ref="messageBoxContentRef"
          tabindex="-1"
        >
          <span v-if="store.title" class="messagebox-title" id="messagebox-title">
            {{ store.title }}
          </span>

          <button
            v-if="!store.hideCloseButton"
            type="button"
            class="messagebox-close-button"
            @click="handleCloseAction"
            aria-label="Close dialog"
          >
            <i class="fas fa-times" aria-hidden="true"></i> <!-- Example icon -->
          </button>

          <div class="messagebox-content" id="messagebox-message">
            <p v-for="(line, index) in messageLines" :key="index">{{ line }}</p>
          </div>

          <div class="messagebox-actions">
            <template v-if="store.variant === 'alert'">
              <BaseButton
                :text="store.okButtonText"
                styleType="filled"
                @click="store.handleOk()"
                ref="okButtonRef"
                class="action-button"
              />
            </template>
            <template v-else-if="store.variant === 'confirm'">
              <BaseButton
                :text="store.cancelButtonText"
                styleType="outlined"
                @click="store.handleCancel()"
                ref="cancelButtonRef"
                class="action-button"
              />
              <BaseButton
                :text="store.confirmButtonText"
                styleType="filled"
                @click="store.handleConfirm()"
                ref="confirmButtonRef"
                class="action-button"
              />
            </template>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref, nextTick, onUnmounted } from 'vue';
import { useMessageBoxStore } from '@/stores/messageBox'; // Adjust path
import BaseButton from './BaseButton.vue';         // Adjust path
// import IconButton from './IconButton.vue'; // If using IconButton for close

export default defineComponent({
  name: 'MessageBox',
  components: {
    BaseButton,
    // IconButton,
  },
  setup() {
    const store = useMessageBoxStore();
    const messageBoxContentRef = ref<HTMLElement | null>(null);
    const okButtonRef = ref<InstanceType<typeof BaseButton> | null>(null);
    const confirmButtonRef = ref<InstanceType<typeof BaseButton> | null>(null);
    const cancelButtonRef = ref<InstanceType<typeof BaseButton> | null>(null);
    let previouslyFocusedElement: HTMLElement | null = null;


    const messageLines = computed(() => {
      // Split message by newline characters to render each line in a <p>
      // This allows for multi-line messages from simple strings.
      return store.message.split('\n');
    });

    const focusFirstInteractiveElement = async () => {
      await nextTick(); // Wait for DOM updates
      if (!messageBoxContentRef.value) return;

      if (store.variant === 'alert' && okButtonRef.value?.$el) {
        (okButtonRef.value.$el as HTMLButtonElement).focus();
      } else if (store.variant === 'confirm') {
        if (confirmButtonRef.value?.$el) { // Prefer confirm button
          (confirmButtonRef.value.$el as HTMLButtonElement).focus();
        } else if (cancelButtonRef.value?.$el) {
          (cancelButtonRef.value.$el as HTMLButtonElement).focus();
        }
      } else {
        // Fallback to focusing the dialog itself if no buttons (should not happen with variants)
        messageBoxContentRef.value.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseAction();
      }
      // Basic focus trapping (can be made more robust)
      if (event.key === 'Tab' && messageBoxContentRef.value) {
        const focusableElements = Array.from(
          messageBoxContentRef.value.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !(el as HTMLElement).hasAttribute('disabled')) as HTMLElement[];

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    watch(() => store.isOpen, (isOpen) => {
      if (isOpen) {
        previouslyFocusedElement = document.activeElement as HTMLElement;
        focusFirstInteractiveElement();
        document.addEventListener('keydown', handleKeyDown);
      } else {
        document.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElement) {
          previouslyFocusedElement.focus();
          previouslyFocusedElement = null;
        }
      }
    });

    const handleOverlayClick = () => {
      // Optionally, make this configurable. For now, acts like cancel/ok.
      handleCloseAction();
    };

    const handleCloseAction = () => {
      if (store.variant === 'alert') {
        store.handleOk();
      } else {
        store.handleCancel();
      }
    };

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    return {
      store,
      messageLines,
      handleOverlayClick,
      handleCloseAction,
      messageBoxContentRef,
      okButtonRef,
      confirmButtonRef,
      cancelButtonRef,
    };
  },
});
</script>

<style scoped>
.messagebox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(var(--color-background-dark-rgb, 5, 12, 5), 0.75); /* Use RGB var */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* High z-index to be on top */
  padding: 1rem; /* Padding for small screens */
  box-sizing: border-box;
}

.messagebox-container {
  background-color: var(--color-background-dark);
  border: 1px solid var(--color-border-primary);
  /* No border-radius as per requirement */
  padding: var(--padding-standard, 1.5rem); /* Generous padding */
  position: relative;
  width: 100%;
  max-width: 450px; /* Max width for the modal */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
  outline: none; /* For when programmatically focused */
}

.messagebox-title {
  position: absolute;
  top: 0;
  left: var(--padding-standard, 1.5rem);
  transform: translateY(-50%);
  display: inline-block;
  font-size: 1rem; /* Adjust as needed */
  font-weight: bold;
  color: var(--color-text-primary);
  padding: 0.1em 0.6em; /* Padding around title text */
  background-color: var(--color-background-dark); /* To hide border underneath */
  white-space: nowrap;
  max-width: calc(100% - (2 * var(--padding-standard, 1.5rem)) - 2em); /* Prevent overflow */
  overflow: hidden;
  text-overflow: ellipsis;
}

.messagebox-close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.2rem; /* Adjust icon size */
  cursor: pointer;
  padding: 0.3rem;
  line-height: 1;
  opacity: 0.7;
}
.messagebox-close-button:hover,
.messagebox-close-button:focus {
  opacity: 1;
  color: var(--color-primary-green);
  outline: none;
}

.messagebox-content {
  margin-top: 1rem; /* Space below title area */
  margin-bottom: 1.5rem; /* Space above actions */
  font-size: 0.95rem;
  line-height: 1.6;
  max-height: 60vh; /* Prevent overly tall messages */
  overflow-y: auto; /* Scroll for long messages */
  /* Custom scrollbar for message content */
}
.messagebox-content p {
  margin: 0 0 0.5em 0; /* Spacing for multi-line messages */
}
.messagebox-content p:last-child {
  margin-bottom: 0;
}

.messagebox-content::-webkit-scrollbar {
  width: 6px;
}
.messagebox-content::-webkit-scrollbar-track {
  background: rgba(var(--color-border-primary-rgb), 0.1);
}
.messagebox-content::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-green);
}


.messagebox-actions {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 0.8rem; /* Space between buttons */
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2);
}
.messagebox-actions .action-button {
  min-width: 80px; /* Ensure buttons have some minimum width */
}


/* Fade transition for the overlay and modal */
.messagebox-fade-enter-active,
.messagebox-fade-leave-active {
  transition: opacity 0.25s ease;
}
.messagebox-fade-enter-active .messagebox-container,
.messagebox-fade-leave-active .messagebox-container {
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.messagebox-fade-enter-from,
.messagebox-fade-leave-to {
  opacity: 0;
}
.messagebox-fade-enter-from .messagebox-container,
.messagebox-fade-leave-to .messagebox-container {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
