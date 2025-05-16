<template>
  <div class="dropdown-filter-wrapper" :class="{ 'is-open': isOpen }">
    <button
      type="button"
      class="dropdown-button"
      @click="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="dropdownId"
      ref="dropdownButton"
    >
      <span class="button-label">{{ currentLabel }}</span>
      <span class="dropdown-arrow" :class="{ 'is-open': isOpen }">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="1em"
          height="1em"
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </span>
    </button>
    <ul
      v-if="isOpen"
      :id="dropdownId"
      class="dropdown-menu"
      role="listbox"
      ref="dropdownMenu"
      @keydown.esc.prevent="closeDropdown"
      @keydown.tab="handleTabKeyInMenu"
    >
      <li
        v-for="(option, index) in options"
        :key="option.value"
        :id="`${dropdownId}-option-${index}`"
        :class="['dropdown-item', { 'is-selected': option.value === modelValue }]"
        role="option"
        :aria-selected="option.value === modelValue"
        tabindex="0"
        @click="selectOption(option)"
        @keydown.enter.prevent="selectOption(option)"
        @keydown.space.prevent="selectOption(option)"
        ref="dropdownItems"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from 'vue'

export interface DropdownOption {
  value: string | number // Value to be emitted
  label: string // Text displayed to the user
  disabled?: boolean // Optional: if the option is disabled
}

let uniqueIdCounter = 0

export default defineComponent({
  name: 'DropdownFilter',

  props: {
    /**
     * The currently selected value (for v-model).
     */
    modelValue: {
      type: [String, Number, Boolean] as PropType<string | number | null>,
      default: null,
    },
    /**
     * An array of option objects. Each object should have 'value' and 'label'.
     */
    options: {
      type: Array as PropType<DropdownOption[]>,
      required: true,
      validator: (value: DropdownOption[]) => {
        return value.every(
          (opt) => opt && typeof opt.value !== 'undefined' && typeof opt.label === 'string',
        )
      },
    },
    /**
     * Placeholder text to display when no option is selected or as a default label.
     */
    placeholder: {
      type: String,
      default: 'Select an option',
    },
    /**
     * Optional label for the dropdown button itself, if different from placeholder or selected option.
     * If not provided, it will show the selected option's label or the placeholder.
     */
    buttonLabel: {
      type: String,
      default: null,
    },
  },

  emits: {
    'update:modelValue': (value: string | number | null) => true, // Allow any of the valid types
  },

  data() {
    return {
      isOpen: false,
      dropdownId: `dropdown-filter-${uniqueIdCounter++}`, // Unique ID for ARIA
    }
  },

  computed: {
    currentLabel(): string {
      if (this.buttonLabel) return this.buttonLabel
      const selectedOption = this.options.find((opt) => opt.value === this.modelValue)
      return selectedOption ? selectedOption.label : this.placeholder
    },
  },

  watch: {
    isOpen(newValue: boolean) {
      if (newValue) {
        nextTick(() => {
          // Focus the first item in the dropdown when it opens
          const menuItems = this.$refs.dropdownItems as HTMLLIElement[]
          if (menuItems && menuItems.length > 0) {
            const selectedIndex = this.options.findIndex((opt) => opt.value === this.modelValue)
            if (selectedIndex !== -1 && menuItems[selectedIndex]) {
              menuItems[selectedIndex].focus()
            } else {
              menuItems[0].focus()
            }
          }
        })
        document.addEventListener('click', this.handleClickOutside)
      } else {
        document.removeEventListener('click', this.handleClickOutside)
      }
    },
  },

  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
      if (!this.isOpen) {
        ;(this.$refs.dropdownButton as HTMLButtonElement)?.focus()
      }
    },
    closeDropdown() {
      if (this.isOpen) {
        this.isOpen = false
        ;(this.$refs.dropdownButton as HTMLButtonElement)?.focus()
      }
    },
    selectOption(option: DropdownOption) {
      if (option.disabled) return
      this.$emit('update:modelValue', option.value)
      this.closeDropdown()
    },
    handleClickOutside(event: MouseEvent) {
      if (this.$el && !this.$el.contains(event.target as Node)) {
        this.closeDropdown()
      }
    },
    handleTabKeyInMenu(event: KeyboardEvent) {
      // Basic tab trapping - could be made more robust with arrow key navigation
      if (event.key === 'Tab') {
        const menuItems = this.$refs.dropdownItems as HTMLLIElement[]
        if (!menuItems || menuItems.length === 0) return

        const firstItem = menuItems[0]
        const lastItem = menuItems[menuItems.length - 1]

        if (event.shiftKey && document.activeElement === firstItem) {
          // Tab from first item, close and focus button
          event.preventDefault()
          this.closeDropdown()
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          // Tab from last item, close and focus button
          event.preventDefault()
          this.closeDropdown()
        }
      }
    },
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
})
</script>

<style scoped>
.dropdown-filter-wrapper {
  position: relative;
  display: inline-block; /* Or block if it should take full width */
  font-family: var(--font-family-monospace);
  min-width: 150px; /* Example min-width, adjust as needed */
}

.dropdown-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.6em 0.8em;
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary);
  border: 1px solid var(--color-primary-green); /* Or --color-border-primary if preferred */
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: left;
  transition:
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-button:hover,
.dropdown-button:focus {
  outline: none;
  /* background-color: darken(var(--color-primary-green), 5%); */ /* Needs a SASS/JS helper or a new var */
  opacity: 0.9; /* Simple hover effect */
}

.button-label {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5em; /* Space before arrow */
}

.dropdown-arrow {
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s ease-in-out;
  flex-shrink: 0;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px); /* Position below the button with a small gap */
  left: 0;
  right: 0;
  background-color: var(--color-background-dark);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius, 4px);
  list-style: none;
  padding: 0.3em 0;
  margin: 0;
  z-index: 10; /* Ensure it's above other content */
  max-height: 200px; /* Prevent overly long dropdowns */
  overflow-y: auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow */
}

.dropdown-item {
  padding: 0.6em 0.8em;
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary);
  outline: none;
}

.dropdown-item.is-selected {
  background-color: var(--color-primary-green); /* Or a slightly different shade for selected */
  color: var(--color-text-on-primary);
  font-weight: bold;
}

.dropdown-item[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: transparent !important; /* Override hover */
  color: var(--color-text-primary) !important; /* Override hover */
}
</style>
