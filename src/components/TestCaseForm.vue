<template>
  <div class="test-case-form" :aria-labelledby="`test-case-heading-${testIndex}`">
    <div class="test-case-header">
      <span class="test-case-number">{{ testIndex + 1 }}</span>
      <div class="form-group test-name-group">
        <!-- <label :for="`test-name-${testIndex}`">Test Name</label> -->
        <input
          :id="`test-name-${testIndex}`"
          type="text"
          :value="localTestCase.name"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          placeholder="Test Name"
          class="test-name-input"
        />
      </div>
<!--      <div class="test-case-actions">-->
<!--        <IconButton-->
<!--          v-if="!isFirstTest"-->
<!--          iconClass="fas fa-arrow-up"-->
<!--          tooltip="Move Up"-->
<!--          aria-label="Move test case up"-->
<!--          size="small"-->
<!--          @click="$emit('move-test-up', testIndex)"-->
<!--        />-->
<!--        <IconButton-->
<!--          v-if="!isLastTest"-->
<!--          iconClass="fas fa-arrow-down"-->
<!--          tooltip="Move Down"-->
<!--          aria-label="Move test case down"-->
<!--          size="small"-->
<!--          @click="$emit('move-test-down', testIndex)"-->
<!--        />-->
<!--        <IconButton-->
<!--          iconClass="fas fa-trash-alt"-->
<!--          tooltip="Delete Test Case"-->
<!--          aria-label="Delete this test case"-->
<!--          variant="danger"-->
<!--          size="small"-->
<!--          @click="$emit('delete-test-case', testIndex)"-->
<!--        />-->
        <!-- <IconButton iconClass="fas fa-pencil-alt" tooltip="Edit" size="small" @click="toggleEditMode" /> -->
<!--      </div>-->
    </div>

    <div class="form-group">
      <label :for="`test-header-${testIndex}`"
        >Test Header
        <span class="field-hint"
          >(Code to run before each test execution, e.g., imports, setup)</span
        ></label
      >
      <CodeEditorInput
        :id="`test-header-${testIndex}`"
        :modelValue="localTestCase.test_header"
        @update:modelValue="updateField('test_header', $event)"
        :language="codeLanguage"
        placeholder="// Optional: Setup code, imports..."
        editorHeight="100px"
      />
    </div>

    <div class="form-group">
      <label :for="`test-code-${testIndex}`"
        >Test Code
        <span class="field-hint">(The actual code to be tested against the solution)</span></label
      >
      <CodeEditorInput
        :id="`test-code-${testIndex}`"
        :modelValue="localTestCase.test"
        @update:modelValue="updateField('test', $event)"
        :language="codeLanguage"
        placeholder="// Your test assertions or function calls here..."
        editorHeight="150px"
      />
    </div>

    <div class="form-group">
      <label :for="`test-result-${testIndex}`"
        >Expected Result <span class="field-hint">(The expected output or value)</span></label
      >
      <input
        :id="`test-result-${testIndex}`"
        type="text"
        :value="localTestCase.test_result"
        @input="updateField('test_result', ($event.target as HTMLInputElement).value)"
        placeholder="Expected output"
        class="result-input"
      />
    </div>
    <!-- Hidden input for ID, useful for updates if test cases have persistent IDs -->
<!--    <input type="hidden" :value="localTestCase.id" />-->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch, toRefs, computed } from 'vue'
import CodeEditorInput from './CodeEditorInput.vue' // Adjust path

// Define the structure for a single test case object
export interface TestCaseData {
  token: string
  name: string
  test_header: string // Code
  test: string // Code
  test_result: string
  // Add other fields like 'isVisibleToUser', 'points', etc. if needed
}

export default defineComponent({
  name: 'TestCaseForm',
  components: {
    CodeEditorInput,
    // IconButton,
  },
  props: {
    /**
     * The data for this specific test case.
     */
    testCaseData: {
      type: Object as PropType<TestCaseData>,
      required: true,
    },
    /**
     * The index of this test case in the list (0-based).
     */
    testIndex: {
      type: Number,
      required: true,
    },
    /**
     * The programming language selected for the main task, to pass to CodeEditorInput.
     */
    codeLanguage: {
      type: String as PropType<
        'javascript' | 'python' | 'cpp' | 'c' | 'rust' | 'typescript' | 'plaintext'
      >,
      default: 'plaintext',
    },
    /**
     * Total number of test cases, used for move up/down button visibility.
     */
    totalTestCases: {
      type: Number,
      default: 1,
    },
  },
  emits: {
    /**
     * Emitted when any field in the test case data is updated.
     * Payload: { index: number, field: keyof TestCaseData, value: any }
     */
    'update:test-case-field': (payload: { index: number; field: keyof TestCaseData; value: any }) =>
      true,
    /**
     * Emitted when the delete button for this test case is clicked.
     * Payload: The index of the test case to delete.
     */
    'delete-test-case': (index: number) => true,
    /**
     * Emitted to move this test case up in the list.
     */
    'move-test-up': (index: number) => true,
    /**
     * Emitted to move this test case down in the list.
     */
    'move-test-down': (index: number) => true,
  },
  setup(props, { emit }) {
    // Use a local reactive copy to avoid directly mutating props
    // This is good practice if you want to batch updates or have complex local logic
    // However, for simple field updates, emitting directly is also common.
    // Here, we'll emit on each change.
    const localTestCase = reactive<TestCaseData>({ ...props.testCaseData })

    // Watch for prop changes to update local state if parent updates the object
    watch(
      () => props.testCaseData,
      (newData) => {
        Object.assign(localTestCase, newData)
      },
      { deep: true },
    )

    const updateField = (field: keyof TestCaseData, value: any) => {
      // Update local state (optional if only emitting)
      // (localTestCase as any)[field] = value; // Not strictly necessary if parent handles all state

      // Emit an event for the parent to update its master list of test cases
      emit('update:test-case-field', {
        index: props.testIndex,
        field,
        value,
      })
    }

    const isFirstTest = computed(() => props.testIndex === 0)
    const isLastTest = computed(() => props.testIndex === props.totalTestCases - 1)

    return {
      localTestCase, // Use this in template for v-model like behavior if not directly emitting
      updateField,
      isFirstTest,
      isLastTest,
    }
  },
})
</script>

<style scoped>
.test-case-form {
  border: 1px solid var(--color-border-primary);
  padding: var(--padding-standard, 1rem);
  margin-bottom: var(--padding-standard, 1rem);
  background-color: var(--color-background-dark); /* Or a slightly different shade */
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
}

.test-case-form:last-child {
  margin-bottom: 0;
}

.test-case-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.3);
}

.test-case-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary);
  font-weight: bold;
  padding: 0.3em 0.6em;
  min-width: 1.5em; /* Ensure number has some width */
  height: 1.5em;
  font-size: 0.9rem;
  line-height: 1;
}

.test-name-group {
  flex-grow: 1;
  margin-bottom: 0 !important; /* Override default form-group margin */
}

.test-name-input,
.result-input {
  width: 95%;
  padding: 0.6em 0.8em;
  background-color: var(--color-background-dark); /* Match editor bg or slightly different */
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.9rem;
}

.test-name-input:focus,
.result-input:focus {
  outline: none;
  border-color: var(--color-primary-green);
}

.test-case-actions {
  display: flex;
  gap: 0.3rem; /* Small gap between action icons */
  margin-left: auto; /* Push actions to the right */
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-primary);
}

.field-hint {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: normal;
  margin-left: 0.5em;
}

/* Ensure CodeEditorInput fits well */
.form-group .code-editor-input-wrapper {
  /* CodeEditorInput handles its own border */
}
</style>
