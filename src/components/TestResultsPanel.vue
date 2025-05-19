<template>
  <ContentBox title="Tests" class="test-results-panel-box" :useInternalTitleStyle="false">
    <!-- <h2 class="panel-title">Tests</h2> -->

    <div v-if="taskPath" class="task-path-display">{{ taskPath }}</div>

    <div class="results-scroll-container" ref="resultsContainerRef">
      <div v-if="isTesting && (!testResults || testResults.length === 0)" class="results-loading">
        <i class="fas fa-spinner fa-spin icon-loading"></i> Running tests...
      </div>
      <div v-else-if="!isTesting && (!testResults || testResults.length === 0)" class="no-results">
        Click "Test" to run your solution against the test cases.
      </div>
      <transition-group v-else name="result-list" tag="div" class="results-list">
        <!-- Ensure each result has a unique id -->
        <TestResultItem
          v-for="result in testResults"
          :key="result.id"
          :result="result"
          class="result-list-item"
        />
      </transition-group>
    </div>

    <div class="panel-footer-actions">
      <BaseButton
        text="Test"
        styleType="outlined"
        @click="emitRunTests"
        :disabled="isTesting || cannotRunTests"
        class="test-button"
      >
        <template #icon v-if="isTesting">
          <i class="fas fa-spinner fa-spin" style="margin-right: 0.5em"></i>
        </template>
      </BaseButton>
    </div>
  </ContentBox>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, nextTick } from 'vue'
import ContentBox from './ContentBox.vue' // Adjust path
import TestResultItem, { type TestResult } from './TestResultItem.vue' // Adjust path
import BaseButton from './BaseButton.vue' // Adjust path

export default defineComponent({
  name: 'TestResultsPanel',
  components: {
    ContentBox,
    TestResultItem,
    BaseButton,
  },
  props: {
    /**
     * An array of test result objects to display.
     */
    testResults: {
      type: Array as PropType<TestResult[]>,
      default: () => [],
    },
    /**
     * Optional file path to display above the test results.
     */
    taskPath: {
      type: String,
      default: '',
    },
    /**
     * Indicates if tests are currently running.
     */
    isTesting: {
      type: Boolean,
      default: false,
    },
    /**
     * Optional: If true, disables the "Test" button for other reasons
     * (e.g., no code entered in the solution editor).
     */
    cannotRunTests: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * Emitted when the "Test" button is clicked.
     */
    'run-tests': () => true,
  },
  methods: {
    emitRunTests() {
      this.$emit('run-tests')
    },
  },
  setup(props) {
    const resultsContainerRef = ref<HTMLElement | null>(null)

    // Scroll to bottom when new test results are added or when testing starts/ends
    watch(
      () => [props.testResults, props.isTesting],
      async () => {
        await nextTick() // Wait for DOM update
        if (resultsContainerRef.value) {
          resultsContainerRef.value.scrollTop = resultsContainerRef.value.scrollHeight
        }
      },
      { deep: true },
    )

    return {
      resultsContainerRef,
    }
  },
})
</script>

<style scoped>
.test-results-panel-box {
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
  display: flex; /* Allow content and footer to be flex items */
  flex-direction: column;
  height: 100%; /* Important for scroll container to fill space */
  /* ContentBox provides main border. Adjust internal padding if needed. */
  /* padding: 0.5rem; */
}

/* If not using ContentBox title prop */
.panel-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 0 0 0.8rem 0;
  padding: 0 0.5rem; /* Align with ContentBox internal padding if used */
}

.task-path-display {
  font-size: 0.8rem;
  color: var(--color-text-primary);
  opacity: 0.6;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem; /* Match panel title padding */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results-scroll-container {
  flex-grow: 1; /* Allow this container to take available vertical space */
  overflow-y: auto; /* Enable vertical scrolling for test results */
  padding: 0 0.5rem; /* Internal padding for the scrollable area */
  min-height: 100px; /* Minimum height before scrolling kicks in */
}

/* Custom scrollbar styling (Webkit browsers) */
.results-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.results-scroll-container::-webkit-scrollbar-track {
  background: var(--color-background-dark); /* Or a slightly different shade */
  border-radius: var(--border-radius-small);
}

.results-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-green);
  border-radius: var(--border-radius-small);
  border: 2px solid var(--color-background-dark); /* Creates padding around thumb */
}

.results-scroll-container::-webkit-scrollbar-thumb:hover {
  opacity: 0.8;
}

.results-loading,
.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; /* Try to center in available space */
  min-height: 80px; /* Ensure some height for the message */
  text-align: center;
  opacity: 0.7;
  font-size: 0.9rem;
}

.icon-loading {
  margin-right: 0.5em;
  font-size: 1.1em;
  color: var(--color-primary-green);
}

.results-list {
  /* Direct child of transition-group if it's a div */
}

.result-list-item {
  /* TestResultItem handles its own styling */
}

/* Transition for adding/removing test results */
.result-list-enter-active,
.result-list-leave-active {
  transition: all 0.3s ease;
}

.result-list-enter-from,
.result-list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.result-list-move {
  transition: transform 0.3s ease;
}

.panel-footer-actions {
  padding: 0.8rem 0.5rem 0.5rem 0.5rem; /* Padding for the footer */
  margin-top: auto; /* Push to bottom if content is short */
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2);
  display: flex;
  justify-content: flex-end; /* Align "Test" button to the right */
}

.test-button {
  min-width: 100px; /* Give button a decent size */
}

.test-button i {
  /* For Font Awesome spinner */
  font-size: 0.9em;
}
</style>
