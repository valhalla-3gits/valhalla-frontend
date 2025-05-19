<template>
  <div class="content-box">
    <!-- Optional Title -->
    <span v-if="title" class="box-title" :style="titleStyles">{{ title }}</span>

    <!-- Content Slot -->
    <div class="box-content">
      <slot></slot>
      <!-- Default slot for component content -->
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type {PropType} from 'vue'

export default defineComponent({
  name: 'ContentBox',

  props: {
    /**
     * Optional title to display in the top-left corner, breaking the border.
     */
    title: {
      type: String as PropType<string | null>,
      required: false,
      default: null,
    },
    titleFontSize: {
      type: String,
      default: '1rem', // Default font size
    },
  },

  setup(props) {
    const titleStyles = computed(() => ({
      fontSize: props.titleFontSize,
    }));

    return {titleStyles};
  }
})
</script>

<style scoped>
.content-box {
  /* Use global variables */
  border: 3px solid var(--color-border-primary);
  background-color: var(
    --color-background-dark
  ); /* Or potentially a slightly different dark shade if needed */
  padding: var(--padding-standard, 1rem); /* Use global padding, fallback */
  position: relative; /* Crucial for absolute positioning of the title */
  margin-bottom: var(--padding-standard, 1rem); /* Add space below the box */
  font-family: var(--font-family-monospace); /* Inherit default font */
  color: var(--color-text-primary); /* Inherit default text color */
}

.box-title {
  /* Positioning the title */
  position: absolute;
  top: 0; /* Align to the top border */
  left: var(--padding-standard, 1rem); /* Offset from the left edge */
  transform: translateY(-50%); /* Shift up by half its height to center on the border */

  /* Styling the title */
  display: inline-block; /* Needed for padding and background */
  font-size: 1rem; /* Slightly smaller than default */
  font-weight: bold;
  color: var(--color-text-primary); /* Or --color-primary-green for emphasis */
  padding: 0 0.6em; /* Horizontal padding to create space around text */

  /* The 'magic' part: Background matches the page background to hide the border */
  background-color: var(--color-background-dark);
  white-space: nowrap; /* Prevent title from wrapping */
  z-index: 1;
}

.box-content {
  /* Add specific styling for the content area if needed */
  /* For example, ensure enough top padding if title is very tall */
  /* padding-top: 0.5rem; */ /* Usually not needed if box padding is sufficient */
}

/* Adjust padding if there's a title to prevent overlap visually */
/* This adds extra top padding only when the title exists */
.content-box:has(.box-title) {
  /* Example: Increase top padding slightly if needed */
  /* padding-top: calc(var(--padding-standard, 1rem) + 0.2rem); */
  /* Often, the default padding is enough, depends on title size */
}
</style>
