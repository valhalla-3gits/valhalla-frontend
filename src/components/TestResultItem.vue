<template>
  <div class="test-result-item" :class="`test-result-item--${result.status.toLowerCase()}`">
    <div class="status-and-name">
      <TagDisplay
        :text="result.status.toUpperCase()"
        :backgroundColor="statusTagBackgroundColor"
        :textColor="statusTagTextColor"
      />
      <span class="test-name">{{ result.name }}</span>
    </div>
    <div v-if="result.message && result.status.toLowerCase() === 'fail'" class="error-message">
      <span class="error-indicator"></span> {{ result.message }}
    </div>
    <div v-if="result.status.toLowerCase() === 'processing'" class="processing-indicator">
      <!-- Optional: Add a small spinner or ellipsis animation here -->
      <span>...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type {PropType} from 'vue'
import TagDisplay from './TagDisplay.vue' // Adjust path if needed

// Define the structure for a single test result object
export type TestStatus = 'SUCCESS' | 'FAIL' | 'PROCESSING' | 'PENDING' | string // Allow custom statuses

export interface TestResult {
  id: string | number // Unique ID for the test result item for :key if needed
  name: string
  status: TestStatus
  message?: string // Optional error message or details
}

export default defineComponent({
  name: 'TestResultItem',
  components: {
    TagDisplay,
  },
  props: {
    /**
     * The test result object to display.
     */
    result: {
      type: Object as PropType<TestResult>,
      required: true,
    },
  },
  setup(props) {
    const statusTagBackgroundColor = computed(() => {
      switch (props.result.status.toLowerCase()) {
        case 'success':
          // Use a slightly different green or yellowish-green for SUCCESS tags as per screenshot
          return 'var(--color-success-tag-bg, #98971a)' // Define in main.css or use existing green
        case 'fail':
          return 'var(--color-danger-tag-bg, #fb4934)' // Define in main.css
        case 'processing':
          return 'var(--color-processing-tag-bg, #7c6f64)' // Define in main.css (a greyish color)
        case 'pending':
          return 'var(--color-pending-tag-bg, #458588)' // Define in main.css (a bluish color)
        default:
          return 'var(--color-default-tag-bg, #665c54)' // Fallback
      }
    })

    const statusTagTextColor = computed(() => {
      switch (props.result.status.toLowerCase()) {
        case 'success':
        case 'fail':
        case 'processing':
        case 'pending':
        default:
          // Most of these backgrounds are dark enough for light text
          return 'var(--color-text-on-dark-tag, #ebdbb2)' // Define if needed, or use existing text color
      }
    })

    return {
      statusTagBackgroundColor,
      statusTagTextColor,
    }
  },
})
</script>

<style scoped>
.test-result-item {
  padding: 0.4em 0.6em;
  margin-bottom: 0.3rem; /* Small space between items */
  font-family: var(--font-family-monospace);
  font-size: 0.9rem;
  line-height: 1.4;
  /* Optional: Add a subtle background or border based on status */
}

/* Example: Different background for FAIL items */
/* .test-result-item--fail {
  background-color: rgba(var(--color-danger-rgb, 251, 73, 52), 0.05);
} */

.status-and-name {
  display: flex;
  align-items: center;
  gap: 0.6em; /* Space between tag and name */
}

.status-tag {
  flex-shrink: 0; /* Prevent tag from shrinking */
  font-size: 0.75rem; /* Make tag text slightly smaller */
  /*padding: 0.4em 0.5em; /* Adjust tag padding */
  font-weight: bold;
}

.test-name {
  color: var(--color-text-primary);
  word-break: break-word; /* Allow long test names to wrap */
}

.error-message {
  margin-top: 0.2em;
  padding-left: calc(
    0.6em + 0.5em + 0.6em + 0.3em
  ); /* Align with test name, accounting for tag width and gap */
  /* This padding might need adjustment based on actual tag width */
  font-size: 0.85rem;
  color: var(--color-danger, #fb4934); /* Use danger color for error text */
  opacity: 0.9;
  display: flex; /* To align indicator and message */
  align-items: flex-start;
}

.error-indicator {
  margin-right: 0.4em;
  font-weight: bold;
  line-height: 1; /* Ensure indicator aligns well */
  color: var(--color-danger, #fb4934);
}

.processing-indicator {
  margin-top: 0.2em;
  padding-left: calc(0.6em + 0.5em + 0.6em + 0.3em); /* Align like error message */
  font-size: 0.85rem;
  color: var(--color-text-primary);
  opacity: 0.7;
}

/* Define these color variables in your main.css if they don't exist */
/*
:root {
  --color-success-tag-bg: #98971a; (gruvbox green/yellow)
  --color-danger-tag-bg: #fb4934; (gruvbox red)
  --color-processing-tag-bg: #7c6f64; (gruvbox grey)
  --color-pending-tag-bg: #458588; (gruvbox blue)
  --color-default-tag-bg: #665c54; (gruvbox darker grey)
  --color-text-on-dark-tag: #ebdbb2; (gruvbox light text)

  --color-danger: #fb4934;
  --color-danger-rgb: 251, 73, 52;
}
*/
</style>
