<template>
  <div class="tag-display" :style="tagStyle">
    <p class="tag-content">{{ text }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed, type CSSProperties } from 'vue'

// Define possible predefined color types or allow any string for custom colors
type TagColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | string

export default defineComponent({
  name: 'TagDisplay',

  props: {
    /**
     * The text content of the tag. Can also be provided via the default slot.
     */
    text: {
      type: String,
      default: '',
    },
    /**
     * The background color of the tag.
     * Can be a predefined keyword ('primary', 'secondary', etc.) or a CSS color string.
     * Defaults to primary green.
     */
    backgroundColor: {
      type: String as PropType<TagColor>,
      default: 'var(--color-primary-green)', // Default to your primary green
    },
    /**
     * The text color of the tag.
     * Defaults to the text color suitable for the primary green background.
     */
    textColor: {
      type: String,
      default: 'var(--color-text-on-primary)', // Default text color for green background
    },
    /**
     * Optional: Border color. If not provided, no border or inherits.
     */
    borderColor: {
      type: String as PropType<string | null>,
      default: null,
    },
    /**
     * Optional: Font size for the tag text.
     */
    fontSize: {
      type: String,
      default: '0.8rem', // Slightly smaller for tags
    },
  },

  setup(props) {
    const tagStyle = computed((): CSSProperties => {
      const style: CSSProperties = {
        backgroundColor: props.backgroundColor,
        color: props.textColor,
        fontSize: props.fontSize,
      }
      if (props.borderColor) {
        style.borderColor = props.borderColor
        style.borderWidth = '5px'
        style.borderStyle = 'solid'
      }
      return style
    })

    return {
      tagStyle,
    }
  },
})
</script>

<style scoped>
.tag-display {
  display: inline-block; /* Or inline-flex if you plan to add icons inside */
  padding: 0.5rem 0.5rem; /* Adjust padding as needed */
  font-family: var(--font-family-monospace);
  font-weight: bold; /* Tags are often bold */
  line-height: 1; /* Adjust for vertical alignment */
  /*height: 1rem;*/
  white-space: nowrap; /* Prevent wrapping */
  cursor: default; /* Or 'pointer' if tags are interactive */
}

.tag-content {
  margin: auto;
  text-align: center;
}
</style>
