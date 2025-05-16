<template>
  <button
    type="button"
    class="icon-button"
    :class="buttonClass"
    :style="buttonStyle"
    @click="$emit('click', $event)"
    :aria-label="ariaLabel || tooltip || 'Icon action'"
    :title="tooltip"
    :disabled="disabled"
  >
    <slot>
      <!-- Default icon rendering using a class -->
      <i v-if="iconClass" :class="iconClass" aria-hidden="true"></i>
      <!-- Or you could use an SVG directly or another icon component -->
    </slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, CSSProperties } from 'vue'

type ButtonSize = 'small' | 'medium' | 'large'
type ButtonVariant = 'default' | 'primary' | 'danger' | 'transparent' // Add more as needed

export default defineComponent({
  name: 'IconButton',

  props: {
    /**
     * CSS class(es) for the icon (e.g., Font Awesome: 'fas fa-trash').
     * Used if the default slot is not provided.
     */
    iconClass: {
      type: String,
      default: '',
    },
    /**
     * Tooltip text to display on hover (also used as a fallback for aria-label).
     */
    tooltip: {
      type: String,
      default: '',
    },
    /**
     * ARIA label for accessibility. Overrides tooltip if both are provided for aria-label.
     */
    ariaLabel: {
      type: String,
      default: '',
    },
    /**
     * Disables the button.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Size of the button.
     */
    size: {
      type: String as PropType<ButtonSize>,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large'].includes(value),
    },
    /**
     * Visual variant of the button for different color schemes.
     */
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'default', // 'default' will use primary green for icon
      validator: (value: string) => ['default', 'primary', 'danger', 'transparent'].includes(value),
    },
    /**
     * Custom color for the icon. Overrides variant color.
     */
    color: {
      type: String,
      default: null,
    },
    /**
     * Custom background color. Overrides variant background.
     */
    backgroundColor: {
      type: String,
      default: 'transparent', // Icon buttons are often transparent by default
    },
    /**
     * Custom hover color for the icon.
     */
    hoverColor: {
      type: String,
      default: null,
    },
    /**
     * Custom hover background color.
     */
    hoverBackgroundColor: {
      type: String,
      default: null,
    },
  },

  emits: ['click'],

  setup(props) {
    const buttonClass = computed(() => [
      `icon-button--${props.size}`,
      `icon-button--variant-${props.variant}`,
    ])

    const buttonStyle = computed((): CSSProperties => {
      const styles: CSSProperties = {
        backgroundColor: props.backgroundColor,
      }

      // Determine icon color based on variant or direct prop
      if (props.color) {
        styles.color = props.color
      } else {
        switch (props.variant) {
          case 'primary':
            styles.color = 'var(--color-text-on-primary)' // If bg is primary green
            if (props.backgroundColor === 'transparent') styles.color = 'var(--color-primary-green)'
            break
          case 'danger':
            styles.color = 'var(--color-danger, #ff4d4d)' // Define --color-danger in main.css
            break
          case 'transparent':
          case 'default':
          default:
            styles.color = 'var(--color-primary-green)'
            break
        }
      }
      return styles
    })

    // For hover styles, it's generally better to use CSS pseudo-classes (:hover)
    // and CSS variables if dynamic hover colors are needed based on props.
    // This setup focuses on base styles via props.

    return {
      buttonClass,
      buttonStyle,
    }
  },
})
</script>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none; /* Typically no border for icon buttons */
  border-radius: var(--border-radius, 4px); /* Or 50% for circular */
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
  outline: none;
  line-height: 1; /* Important for icon alignment */
  font-family: var(--font-family-monospace); /* Just in case text is used in slot */
  -webkit-appearance: none; /* Remove default browser styling */
  -moz-appearance: none;
  appearance: none;
}

/* Default variant styling (transparent background, green icon) */
.icon-button--variant-default {
  /* color is set by buttonStyle computed prop */
}

.icon-button--variant-default:hover:not(:disabled),
.icon-button--variant-default:focus:not(:disabled) {
  background-color: rgba(var(--color-primary-green-rgb, 1, 255, 0), 0.1); /* Subtle green hover */
  /* color: var(--color-primary-green); */ /* Ensure icon color remains or changes as desired */
}

/* Primary variant (e.g., green background, dark icon) */
.icon-button--variant-primary {
  background-color: var(--color-primary-green);
  /* color is set by buttonStyle computed prop */
}

.icon-button--variant-primary:hover:not(:disabled),
.icon-button--variant-primary:focus:not(:disabled) {
  opacity: 0.85;
}

/* Danger variant (e.g., red icon) */
.icon-button--variant-danger {
  /* color is set by buttonStyle computed prop */
}

.icon-button--variant-danger:hover:not(:disabled),
.icon-button--variant-danger:focus:not(:disabled) {
  background-color: rgba(255, 77, 77, 0.1); /* Subtle red hover */
  color: var(--color-error-primary, #cc0000); /* Darker red on hover */
}

/* Transparent variant (explicitly transparent, might have different hover) */
.icon-button--variant-transparent {
  background-color: transparent;
  /* color is set by buttonStyle computed prop */
}

.icon-button--variant-transparent:hover:not(:disabled),
.icon-button--variant-transparent:focus:not(:disabled) {
  background-color: rgba(
    var(--color-text-primary-rgb, 235, 219, 178),
    0.1
  ); /* Subtle hover based on text color */
}

/* Sizes */
.icon-button--small {
  padding: 0.3em;
  font-size: 0.8rem; /* Affects icon size if using 'em' units for icon */
}

.icon-button--small i,
.icon-button--small svg {
  font-size: 1.1em; /* Make icon slightly larger than button font-size */
}

.icon-button--medium {
  padding: 0.5em;
  font-size: 1rem;
}

.icon-button--medium i,
.icon-button--medium svg {
  font-size: 1.2em;
}

.icon-button--large {
  padding: 0.7em;
  font-size: 1.2rem;
}

.icon-button--large i,
.icon-button--large svg {
  font-size: 1.2em;
}

/* Disabled state */
.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: transparent !important; /* Ensure no hover bg on disabled */
  /* color: var(--color-text-disabled, #777) !important; */ /* Ensure disabled color */
}

/* Default icon styling if using <i> tag with classes */
.icon-button i {
  display: block; /* Helps with alignment and sizing */
}

.icon-button svg {
  display: block;
  width: 1em; /* Default SVG size relative to button's font-size */
  height: 1em;
}
</style>
