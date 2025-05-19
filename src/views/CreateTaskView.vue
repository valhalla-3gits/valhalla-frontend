<template>
  <div class="create-task-view">
    <div v-if="isLoadingView" class="view-loading-state">
      <p>{{ viewLoadingMessage }}</p>
      <!-- Add a spinner component here if desired -->
    </div>
    <form v-else @submit.prevent="handleSubmitTask" class="task-form-layout">
      <div class="main-field">
        <div class="column column-left">
          <TaskDetailsForm
            :initial-data="taskData"
            :rank-options="rankOptions"
            :language-options="languageOptions"
            @update-field="handleDetailFieldUpdate"
            @create-test="addNewTestCase"
            ref="taskDetailsFormRef"
          />
        </div>

        <div class="column column-right">
          <ContentBox>
            <TestCasesList
              :testCases="taskData.tests"
              :codeLanguage="selectedLanguageForEditor"
              @update-test-case="handleTestCaseFieldUpdate"
              @delete-test-case="handleDeleteTestCase"
              @move-test-up="handleMoveTestCaseUp"
              @move-test-down="handleMoveTestCaseDown"
              ref="testCasesListRef"
            />
          </ContentBox>
        </div>
      </div>

      <div class="form-actions-footer full-width-footer">
        <BaseButton
          text="Cancel"
          styleType="outlined"
          type="button"
          @click="handleCancel"
          :disabled="isSubmitting"
        />
        <BaseButton
          :text="isEditMode ? 'Update Task' : 'Save Task'"
          styleType="filled"
          type="submit"
          :disabled="isSubmitting || !isFormValid"
        >
          <template #icon v-if="isSubmitting">
            <i class="fas fa-spinner fa-spin" style="margin-right: 0.5em"></i>
            <!-- Spinner icon -->
          </template>
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Assuming auth store for user/token
import apiClient from '@/services/api' // Your configured Axios instance

// Import Components
import TaskDetailsForm, { type TaskDetailsData } from '@/components/TaskDetailsForm.vue' // Adjust path
import TestCasesList from '@/components/TestCasesList.vue' // Adjust path
import { type TestCaseData } from '@/components/TestCaseForm.vue' // Adjust path
import BaseButton from '@/components/BaseButton.vue' // Adjust path
import { type DropdownOption } from '@/components/DropdownFilter.vue'
import ContentBox from '@/components/ContentBox.vue' // Adjust path

// Define the overall task structure including test cases
interface TaskFullData {
  id?: string | number // Present in edit mode
  name: ''
  rank_id: null
  language_id: null
  description: ''
  output_examples: ''
  prototype: ''
  tests: TestCaseData[]
}

type SupportedEditorLanguage =
  | 'javascript'
  | 'python'
  | 'cpp'
  | 'c'
  | 'rust'
  | 'typescript'
  | 'plaintext'

export default defineComponent({
  name: 'CreateTaskView',
  components: {
    ContentBox,
    TaskDetailsForm,
    TestCasesList,
    BaseButton,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore() // If needed for user ID or permissions

    const taskToken = ref<string | number | null>((route.params.token as string) || null) // Get ID from route for edit mode
    const isEditMode = computed(() => !!taskToken.value)

    const isLoadingView = ref(false)
    const viewLoadingMessage = ref('Loading task data...')
    const isSubmitting = ref(false)

    const taskData = reactive<TaskFullData>({
      name: '',
      rank_id: null,
      language_id: null,
      description: '',
      output_examples: '',
      prototype: '',
      tests: [],
    })

    const rankOptions = ref<DropdownOption[]>([])
    const languageOptions = ref<DropdownOption[]>([])

    // Refs for child components to call methods like scrollToBottom
    const testCasesListRef = ref<InstanceType<typeof TestCasesList> | null>(null)
    // const taskDetailsFormRef = ref<InstanceType<typeof TaskDetailsForm> | null>(null); // If needed

    // --- Computed Properties ---
    const selectedLanguageForEditor = computed((): SupportedEditorLanguage => {
      const selectedLangOption = languageOptions.value.find(
        (opt) => opt.value === taskData.language_id,
      )
      if (selectedLangOption) {
        const langLabel = selectedLangOption.label.toLowerCase()
        if (['javascript', 'python', 'cpp', 'c', 'rust', 'typescript'].includes(langLabel)) {
          return langLabel as SupportedEditorLanguage
        }
      }
      return 'plaintext'
    })

    const isFormValid = computed(() => {
      // Add your validation logic here
      // Example:
      return (
        taskData.name.trim() !== '' &&
        taskData.description.trim() !== '' &&
        taskData.language_id !== null &&
        taskData.rank_id !== null &&
        taskData.tests.length > 0 &&
        taskData.tests.every((tc) => tc.name.trim() !== '' && tc.test_result.trim() !== '')
      )
    })

    // --- Methods ---
    const fetchTaskDataForEdit = async () => {
      if (!isEditMode.value || !taskToken.value) return
      isLoadingView.value = true
      viewLoadingMessage.value = 'Loading task for editing...'
      try {
        const response = await apiClient.get(`/tasks/${taskToken.value}`) // GET /api/tasks/token
        const fetchedTask = response.data //as TaskFullData // Assume API returns this structure
        taskData.name = fetchedTask.name
        taskData.rank_id = fetchedTask.rank.id
        taskData.language_id = fetchedTask.language.id
        taskData.description = fetchedTask.description
        taskData.output_examples = fetchedTask.output_examples
        taskData.prototype = fetchedTask.prototype
        taskData.tests = [...(fetchedTask.tests || [])]
      } catch (error) {
        console.error('Failed to load task for editing:', error)
        // Handle error (e.g., show notification, redirect to 404 or dashboard)
        router.push('/dashboard') // Example redirect
        alert('Could not load the task for editing.')
      } finally {
        isLoadingView.value = false
      }
    }

    const fetchDropdownOptions = async () => {
      isLoadingView.value = true // Can combine with task loading message
      viewLoadingMessage.value = 'Loading options...'
      try {
        const [ranksRes, languagesRes] = await Promise.all([
          apiClient.get('/meta/ranks'),
          apiClient.get('/meta/languages'),
        ])
        rankOptions.value = ranksRes.data.map((r: { id: any; name: any }) => ({
          value: r.id,
          label: r.name,
        }))
        languageOptions.value = languagesRes.data.map((l: { id: any; name: any }) => ({
          value: l.id,
          label: l.name,
        }))
      } catch (error) {
        console.error('Failed to fetch dropdown options:', error)
        alert('Could not load necessary options. Please try again later.')
      } finally {
        // isLoadingView might be set to false by fetchTaskDataForEdit if in edit mode
        if (!isEditMode.value) isLoadingView.value = false
      }
    }

    const handleDetailFieldUpdate = (payload: { field: keyof TaskDetailsData; value: any }) => {
      ;(taskData as any)[payload.field] = payload.value
    }

    const handleTestCaseFieldUpdate = (payload: {
      index: number
      field: keyof TestCaseData
      value: any
    }) => {
      if (taskData.tests[payload.index]) {
        ;(taskData.tests[payload.index] as any)[payload.field] = payload.value
      }
    }

    const addNewTestCase = async () => {
      const newId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // More unique temp ID
      taskData.tests.push({
        token: newId,
        name: `Test Case ${taskData.tests.length + 1}`,
        test_header: '',
        test: '',
        test_result: '',
      })
      // Scroll to the newly added test case
      await nextTick() // Wait for DOM update
      testCasesListRef.value?.scrollToBottom?.() // Call method on child if exposed and available
    }

    const handleDeleteTestCase = (index: number) => {
      taskData.tests.splice(index, 1)
    }

    const handleMoveTestCaseUp = (index: number) => {
      if (index > 0) {
        const item = taskData.tests.splice(index, 1)[0]
        taskData.tests.splice(index - 1, 0, item)
      }
    }

    const handleMoveTestCaseDown = (index: number) => {
      if (index < taskData.tests.length - 1) {
        const item = taskData.tests.splice(index, 1)[0]
        taskData.tests.splice(index + 1, 0, item)
      }
    }

    const handleSubmitTask = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields and add at least one valid test case.')
        return
      }
      isSubmitting.value = true
      try {
        let response
        const payload = JSON.parse(JSON.stringify(taskData)) // Deep clone to remove reactivity for API
        // Remove temporary IDs from new test cases if backend assigns them
        payload.tests.forEach((tc: TestCaseData) => {
          if (typeof tc.token === 'string' && tc.token.startsWith('temp-')) {
            delete (tc as any).token
          }
        })

        if (isEditMode.value) {
          response = await apiClient.put(`/tasks/${taskToken.value}`, payload) // PUT /api/tasks/:id
          alert('Task updated successfully!')
        } else {
          response = await apiClient.post('/tasks', payload) // POST /api/tasks
          alert('Task created successfully!')
        }
        console.log('Server response:', response.data)
        router.push('/dashboard') // Or to the task view page: `/task/${response.data.id}`
      } catch (error: any) {
        console.error('Failed to save task:', error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to save task. Please try again.'
        alert(errorMessage)
      } finally {
        isSubmitting.value = false
      }
    }

    const handleCancel = () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        router.back() // Or router.push('/dashboard');
      }
    }

    // --- Lifecycle Hooks ---
    onMounted(async () => {
      await fetchDropdownOptions() // Fetch options first
      if (isEditMode.value) {
        await fetchTaskDataForEdit()
      } else {
        // Set default language or rank if needed for new tasks
        // if (languageOptions.value.length > 0) taskData.details.languageId = languageOptions.value[0].value;
        // if (rankOptions.value.length > 0) taskData.details.rankId = rankOptions.value[0].value;
      }
    })

    return {
      isEditMode,
      isLoadingView,
      viewLoadingMessage,
      isSubmitting,
      taskData,
      rankOptions,
      languageOptions,
      selectedLanguageForEditor,
      isFormValid,
      handleDetailFieldUpdate,
      handleTestCaseFieldUpdate,
      addNewTestCase,
      handleDeleteTestCase,
      handleMoveTestCaseUp,
      handleMoveTestCaseDown,
      handleSubmitTask,
      handleCancel,
      testCasesListRef,
      // taskDetailsFormRef,
    }
  },
})
</script>

<style scoped>
.create-task-view {
  padding: var(--padding-standard, 1rem);
  background-color: var(--color-background-dark);
  /*min-height: calc(100vh - var(--header-height, 60px) - var(--footer-height, 50px));*/
  font-family: var(--font-family-monospace);
}

.view-loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: var(--color-text-primary);
  font-size: 1.2rem;
}

.task-form-layout {
  display: flex;
  flex-direction: column;
  gap: var(--padding-standard, 1rem); /* Space between columns */
  max-width: 1600px; /* Max width for the content */
  margin: 0 auto; /* Center the layout */
  border: 1px solid var(--color-border-primary); /* Main border for the whole form area */
  padding: var(--padding-standard, 1rem);
  position: relative; /* For footer positioning */
}

.main-field {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: var(--padding-standard, 1rem); /* Space between components within a column */
}

.column-left {
  flex: 1; /* Adjust flex ratio as needed, e.g., 1 or 2 */
  min-width: 350px;
}

.column-right {
  flex: 1.5; /* Adjust flex ratio, e.g., 1.5 or 3 */
  min-width: 400px;
  /* Ensure TestCasesList can take height */
  display: flex; /* Make it a flex container for TestCasesList to grow */
  flex-direction: column;
  height: 100%;
}

.column-right .test-cases-list-wrapper {
  /*flex-grow: 1; /* Allow TestCasesList to take available space */
}

.form-actions-footer {
  grid-column: 1 / -1; /* Span full width if task-form-layout was a grid */
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: var(--padding-standard, 1rem);
  margin-top: var(--padding-standard, 1rem); /* Space above footer */
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.3); /* Fainter separator */
  width: calc(
    100% + (2 * var(--padding-standard, 1rem))
  ); /* Span full width of bordered container */
  margin-left: calc(-1 * var(--padding-standard, 1rem));
  margin-right: calc(-1 * var(--padding-standard, 1rem));
  padding-left: var(--padding-standard, 1rem);
  padding-right: var(--padding-standard, 1rem);
  box-sizing: border-box;
  position: sticky; /* Make footer sticky at the bottom of the form area */
  bottom: 0;
  background-color: var(--color-background-dark); /* Match form background */
  padding-bottom: var(--padding-standard, 1rem); /* Padding below buttons */
  z-index: 5; /* Ensure it's above scroll content if columns scroll */
}

/* This makes the footer span the width of the .task-form-layout */
.task-form-layout > .full-width-footer {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  /* If .task-form-layout has padding, adjust footer padding or width accordingly */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  /* Adjust breakpoint */
  .task-form-layout {
    flex-direction: column;
    border: none; /* Remove main border if stacking */
    padding: 0;
  }

  .column-left,
  .column-right {
    flex: none;
    width: 100%;
    border: 1px solid var(--color-border-primary); /* Add borders to stacked columns */
    padding: var(--padding-standard, 1rem);
  }

  .form-actions-footer {
    position: static; /* Unstick footer on mobile if it causes issues */
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    border-top: 1px solid var(--color-border-primary); /* Stronger border if static */
  }
}
</style>
