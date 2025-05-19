<template>
  <div class="test-cases-list-wrapper">
    <div v-if="!testCases || testCases.length === 0" class="empty-state-tests">
      <p>No test cases added yet.</p>
      <p>Click "+ Create Test" on the left to add your first test case.</p>
    </div>
    <div v-else class="test-cases-scroll-container" ref="scrollContainer">
      <transition-group name="test-case-list" tag="div" class="test-cases-list">
        <!-- Assuming each testCase has a unique id -->
        <TestCaseForm
          v-for="(testCase, index) in testCases"
          :key="testCase.token"
          :testCaseData="testCase"
          :testIndex="index"
          :codeLanguage="codeLanguage"
          :totalTestCases="testCases.length"
          @update:test-case-field="handleFieldUpdate"
          @delete-test-case="handleDeleteTestCase"
          @move-test-up="handleMoveTestUp"
          @move-test-down="handleMoveTestDown"
          class="test-case-list-item"
        />
      </transition-group>
    </div>
<!--    <div v-if="testCases && testCases.length > 0" class="list-actions-footer">-->
<!--      &lt;!&ndash; Example: Button to add new test directly here, though primary is on left &ndash;&gt;-->
<!--      &lt;!&ndash; <BaseButton text="+ Add Another Test" styleType="outlined" @click="$emit('add-new-test-case')" /> &ndash;&gt;-->
<!--    </div>-->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick, ref } from 'vue'
import TestCaseForm, { type TestCaseData } from './TestCaseForm.vue' // Adjust path
// import BaseButton from './BaseButton.vue'; // If using a button in list-actions-footer

export default defineComponent({
  name: 'TestCasesList',
  components: {
    TestCaseForm,
    // BaseButton,
  },
  props: {
    /**
     * An array of test case data objects.
     * This prop should be managed by the parent (e.g., CreateTaskView)
     * and updated via emitted events.
     */
    testCases: {
      type: Array as PropType<TestCaseData[]>,
      required: true,
    },
    /**
     * The programming language selected for the main task,
     * to be passed down to each TestCaseForm.
     */
    codeLanguage: {
      type: String as PropType<
        'javascript' | 'python' | 'cpp' | 'c' | 'rust' | 'typescript' | 'plaintext'
      >,
      default: 'plaintext',
    },
  },
  emits: {
    /**
     * Emitted when a field within a specific test case is updated.
     * The parent component should handle updating its master list of test cases.
     * Payload: { index: number, field: keyof TestCaseData, value: any }
     */
    'update-test-case': (payload: { index: number; field: keyof TestCaseData; value: any }) => true,
    /**
     * Emitted when a test case needs to be deleted.
     * Payload: The index of the test case to delete.
     */
    'delete-test-case': (index: number) => true,
    /**
     * Emitted when a test case needs to be moved up.
     */
    'move-test-up': (index: number) => true,
    /**
     * Emitted when a test case needs to be moved down.
     */
    'move-test-down': (index: number) => true,
    /**
     * Optional: If you add a button here to create a new test case
     */
    // 'add-new-test-case': () => true,
  },
  setup(props, { emit }) {
    const scrollContainer = ref<HTMLElement | null>(null)

    const handleFieldUpdate = (payload: {
      index: number
      field: keyof TestCaseData
      value: any
    }) => {
      emit('update-test-case', payload)
    }

    const handleDeleteTestCase = (index: number) => {
      emit('delete-test-case', index)
    }

    const handleMoveTestUp = (index: number) => {
      emit('move-test-up', index)
    }

    const handleMoveTestDown = (index: number) => {
      emit('move-test-down', index)
    }

    // Method to scroll to the bottom when a new test case is added
    // This would be called by the parent component after adding a test case to the `testCases` prop
    const scrollToBottom = async () => {
      await nextTick() // Wait for DOM update
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    }

    // Expose scrollToBottom so parent can call it
    // (Parent would need a ref to this TestCasesList component)
    // Alternatively, parent can manage scrolling itself after updating the testCases prop.

    return {
      handleFieldUpdate,
      handleDeleteTestCase,
      handleMoveTestUp,
      handleMoveTestDown,
      scrollContainer,
      scrollToBottom, // Expose if needed by parent
    }
  },
})
</script>

<style scoped>
.test-cases-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%; /* Allow it to take available height in flex parent */
  font-family: var(--font-family-monospace);
}

.empty-state-tests {
  flex-grow: 1; /* Take up space if empty */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-primary);
  opacity: 0.6;
  border: 1px dashed var(--color-border-primary);
  font-size: 0.9rem;
}

.empty-state-tests p {
  margin: 0.3rem 0;
}

.test-cases-scroll-container {
  flex-grow: 1; /* Allow this container to take available vertical space */
  overflow-y: auto; /* Enable vertical scrolling */
  padding-right: 5px; /* Space for scrollbar to not overlap content too much */
  /* Custom scrollbar styling (Webkit browsers) */
}

.test-cases-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.test-cases-scroll-container::-webkit-scrollbar-track {
  background: var(--color-background-dark); /* Or a slightly different shade */
}

.test-cases-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-green);
  border: 2px solid var(--color-background-dark); /* Creates padding around thumb */
}

.test-cases-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-primary-green); /* Or a slightly brighter green */
  opacity: 0.8;
}

.test-cases-list {
  /* The direct child of transition-group if it's a div */
}

.test-case-list-item {
  /* Margin is handled by TestCaseForm, but can add here if needed */
}

/* Transition for adding/removing test cases */
.test-case-list-enter-active,
.test-case-list-leave-active {
  transition: all 0.3s ease;
}

.test-case-list-enter-from,
.test-case-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Ensure moving items also transition smoothly */
.test-case-list-move {
  transition: transform 0.3s ease;
}

.list-actions-footer {
  padding-top: var(--padding-standard, 1rem);
  margin-top: auto; /* Push to bottom if list is short */
  border-top: 1px solid rgba(var(--color-border-primary-rgb), 0.2);
  display: flex;
  justify-content: flex-end; /* Or center */
}
</style>
