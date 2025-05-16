<template>
  <div class="search-input-wrapper">
    <input
      type="search"
      class="search-input"
      :value="modelValue"
      @input="onInput"
      @keyup.enter="onSearch"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder || 'Search'"
    />
    <button type="button" class="search-button" @click="onSearch" aria-label="Submit search">
      <!-- Slot for custom icon, or use a default one -->
      <slot name="icon">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="1em"
          height="1em"
        >
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </slot>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'SearchInput',

  props: {
    /**
     * The current value of the search input (for v-model).
     */
    modelValue: {
      type: String,
      default: '',
    },
    /**
     * Placeholder text for the input field.
     */
    placeholder: {
      type: String,
      default: 'Search...',
    },
    /**
     * Optional ARIA label for the input field for accessibility.
     * Defaults to placeholder or 'Search'.
     */
    ariaLabel: {
      type: String as PropType<string | null>,
      default: null,
    },
  },

  emits: {
    /**
     * Emitted when the input value changes (for v-model).
     */
    'update:modelValue': (value: string) => typeof value === 'string',
    /**
     * Emitted when the search is triggered (e.g., search button click or Enter key).
     * Payload is the current search term.
     */
    search: (searchTerm: string) => typeof searchTerm === 'string',
  },

  methods: {
    onInput(event: Event) {
      const target = event.target as HTMLInputElement
      this.$emit('update:modelValue', target.value)
    },
    onSearch() {
      this.$emit('search', this.modelValue)
    },
  },
})
</script>

<style scoped>
.search-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-dark); /* Or a slightly different input bg */
  border-radius: var(--border-radius, 4px); /* Optional */
  font-family: var(--font-family-monospace);
  width: 100%; /* Make it take full width of its container by default */
  max-width: 400px; /* Example max-width, adjust as needed */
}

.search-input {
  flex-grow: 1; /* Input takes most of the space */
  padding: 0.6em 0.8em;
  border: none; /* Border is on the wrapper */
  background-color: transparent; /* Inherit from wrapper or set explicitly */
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.95rem; /* Adjust as needed */
  outline: none; /* Remove default outline */
}

.search-input::placeholder {
  color: var(--color-text-primary);
  opacity: 0.6;
}

/* Specific styling for type="search" clear button (X) if desired */
.search-input::-webkit-search-cancel-button {
  /* -webkit-appearance: none; */ /* To customize */
  /* Example: */
  /* filter: invert(1) brightness(0.7); */
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6em 0.8em; /* Match input padding for height consistency */
  border: none;
  border-left: 1px solid var(--color-border-primary); /* Separator line */
  background-color: transparent; /* Or a slightly different shade for button area */
  color: var(--color-primary-green); /* Icon color */
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
  outline: none;
}

.search-button:hover,
.search-button:focus {
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary); /* Icon color on hover */
}

.search-icon {
  width: 1.1em; /* Adjust icon size */
  height: 1.1em;
  display: block; /* Prevents extra space below inline SVGs */
}
</style>
