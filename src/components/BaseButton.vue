<template>
  <button
    :class="buttonClasses"
    :style="buttonStyles"
    type="button"
    @click="$emit('click', $event)"
  >
    <span class="button__text">{{ text }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue' // Imports used as values
import type { PropType } from 'vue' // Import used only as a type

// Define possible style types for better type checking and validation
type ButtonStyleType = 'filled' | 'outlined'

export default defineComponent({
  name: 'BaseButton',

  props: {
    /**
     * The text content of the button.
     */
    text: {
      type: String,
      required: true,
    },
    /**
     * The font size for the button text (e.g., '16px', '1rem', '1.2em').
     */
    fontSize: {
      type: String,
      default: '1rem', // Default font size
    },
    /**
     * The style variant of the button.
     */
    styleType: {
      type: String as PropType<ButtonStyleType>,
      default: 'filled',
      validator: (value: string) => ['filled', 'outlined'].includes(value), // Validate input
    },
  },

  emits: ['click'], // Declare the click event

  setup(props) {
    // --- Computed Properties ---

    // Dynamically compute the CSS classes based on props
    const buttonClasses = computed(() => [
      'button',
      `button--${props.styleType}`, // Apply style variant class
    ])

    // Dynamically compute inline styles
    const buttonStyles = computed(() => ({
      fontSize: props.fontSize,
    }))

    return {
      buttonClasses,
      buttonStyles,
    }
  },
})
</script>

<style scoped>
/* Define color variables locally or globally (e.g., in :root) */
.button {
  display: inline-flex; /* Aligns icon and text nicely */
  align-items: center;
  justify-content: center;
  padding: 0.6em 1.2em;
  border: 2px solid transparent; /* Reserve space for border */
  cursor: pointer;
  font-family: var(--font-family-monospace); /* Monospace font like the example */
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
  line-height: 1.2; /* Adjust for better vertical centering */
  white-space: nowrap; /* Prevent text wrapping */
}

/* Style Variants */
.button--filled {
  background-color: var(--color-primary-green);
  border-color: var(--color-primary-green);
  color: var(--color-text-on-primary);
}

.button--outlined {
  background-color: var(--color-background-dark);
  border-color: var(--color-primary-green);
  color: var(--color-text-primary);
}

/* Hover/Focus States (Example) */
.button--filled:hover,
.button--filled:focus {
  opacity: 0.85; /* Simple hover effect */
}

.button--outlined:hover,
.button--outlined:focus {
  background-color: var(--color-primary-green); /* Invert on hover */
  color: var(--color-background-dark);
}

/* Icon Styling */
.button__icon {
  display: inline-block; /* Ensure icon takes space */
}

.button--with-icon .button__icon {
  margin-right: 0.5em; /* Space between icon and text */
}

/* Optional: Add active state */
.button:active {
  opacity: 0.7;
}

/* Optional: Add disabled state */
.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
