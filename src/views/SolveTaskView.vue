<template>
  <div class="solve-task-view">
    <div v-if="isLoadingTaskData" class="view-loading-state">
      <p>Loading task details...</p>
      <!-- Add a spinner component here if desired -->
    </div>
    <div v-else-if="!task" class="view-error-state">
      <p>Could not load the task. Please try again or go back to the dashboard.</p>
      <BaseButton text="Go to Dashboard" @click="goToDashboard" styleType="outlined" />
    </div>
    <div v-else class="solve-task-grid-layout">
      <!-- Header is assumed to be in App.vue or a parent layout -->

      <TaskDescriptionPanel
        class="panel description-panel"
        :taskTitle="task.name"
        :description="task.description"
        :showAddToFavourites="!isTaskFavorited"
        @add-to-favourites="handleAddToFavorites"
      />

      <RunicGutter
        orientation="vertical"
        :is-active="isTestingGutterActive"
        class="gutter vertical-gutter"
        thickness="3rem"
        rune-size="2rem"
        :rune-spacing="50"
      />

      <SolutionEditorPanel
        class="panel solution-panel"
        v-model="userSolution"
        :language="taskLanguage"
        :editorPlaceholder="`// Your ${taskLanguage} solution here...`"
        editorHeight="30vh"
        :readOnly="isSubmittingSolution"
        :showFooterActions="true"
        @reset-code="handleResetCode"
        ref="solutionEditorPanelRef"
      />

      <RunicGutter
        orientation="horizontal"
        :is-active="isTestingGutterActive"
        class="gutter horizontal-gutter"
        thickness="3rem"
        rune-size="2rem"
        :rune-spacing="50"
      />
      <!-- Horizontal gutter needs to span all columns in its row -->
      <!-- CSS Grid will handle this if .horizontal-gutter is placed in grid-area: 2 / 1 / 3 / 4; -->

      <TaskExamplesPanel class="panel examples-panel" :examples-markdown="task.output_examples" />

      <!-- The vertical gutter is one continuous element spanning rows, or two separate ones -->
      <!-- If it's one continuous, it's already defined. If separate, add another here. -->
      <!-- For simplicity, assuming vertical-gutter spans all rows. -->

      <TestResultsPanel
        class="panel tests-panel"
        :testResults="testResults"
        :taskPath="task.name"
        :isTesting="isTestingSolution"
        :cannotRunTests="!userSolution.trim() || isSubmittingSolution"
        @run-tests="handleRunTests"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'

// Import Components
import TaskDescriptionPanel from '@/components/TaskDescriptionPanel.vue'
import SolutionEditorPanel from '@/components/SolutionEditorPanel.vue'
import TaskExamplesPanel from '@/components/TaskExamplesPanel.vue'
import TestResultsPanel from '@/components/TestResultsPanel.vue'
import { type TestResult } from '@/components/TestResultItem.vue'
import RunicGutter from '@/components/RunicGutter.vue'
import BaseButton from '@/components/BaseButton.vue'
import type { TestCaseData } from '@/components/TestCaseForm.vue' // For error state button

// Define the structure for the full task data fetched from API
interface TaskData {
  id?: string | number // Present in edit mode
  name: ''
  rank_id: number
  language_id: number
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
  name: 'SolveTaskView',
  components: {
    TaskDescriptionPanel,
    SolutionEditorPanel,
    TaskExamplesPanel,
    TestResultsPanel,
    RunicGutter,
    BaseButton,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore() // If needed for user-specific actions

    const taskToken = ref<string | null>((route.params.token as string) || null)
    const task = ref<TaskData | null>(null)
    const isLoadingTaskData = ref(true)

    const userSolution = ref('')
    const testResults = ref<TestResult[]>([])
    const isTestingSolution = ref(false) // For the "Test" button and TestResultsPanel
    const isSubmittingSolution = ref(false) // For a potential final "Submit" button (not in UI yet)

    const isTaskFavorited = ref(false) // Placeholder for favorite state
    const isTestingGutterActive = ref(false) // For RunicGutter animation
    let gutterTimeoutId: number | null = null

    const solutionEditorPanelRef = ref<InstanceType<typeof SolutionEditorPanel> | null>(null)

    const taskLanguage = ref<SupportedEditorLanguage>('plaintext')

    // --- Methods ---
    const fetchTaskDetails = async () => {
      if (!taskToken.value) {
        console.error('No Task Token provided.')
        task.value = null // Ensure error state is shown
        isLoadingTaskData.value = false
        return
      }
      isLoadingTaskData.value = true
      try {
        const response = await apiClient.get(`/tasks/${taskToken.value}`) // GET /api/tasks/:token
        const fetchedTask = response.data //as TaskFullData // Assume API returns this structure
        task.value = {
          name: fetchedTask.name,
          rank_id: fetchedTask.rank.id,
          language_id: fetchedTask.language.id,
          description: fetchedTask.description,
          output_examples: fetchedTask.output_examples,
          prototype: fetchedTask.prototype,
          tests: [...(fetchedTask.tests || [])],
        } as TaskData
        userSolution.value = task.value?.prototype || ''
        // Fetch favorite status if applicable
        // const favResponse = await apiClient.get(`/tasks/${taskId.value}/favorite-status`);
        // isTaskFavorited.value = favResponse.data.isFavorited;

        const languagesRes = await apiClient.get('/meta/languages')
        const taskLanguageRes = languagesRes.data.find(
          (l: { id: number; name: string }) => l.id === task.value?.language_id || false,
        )
        if (taskLanguageRes) {
          const langLabel = taskLanguageRes.name.toLowerCase()
          if (['javascript', 'python', 'cpp', 'c', 'rust', 'typescript'].includes(langLabel)) {
            taskLanguage.value = taskLanguageRes.name as SupportedEditorLanguage
          } else {
            taskLanguage.value = 'plaintext'
          }
        }
      } catch (error) {
        console.error('Failed to load task details:', error)
        task.value = null // Trigger error state in template
        // Optionally show a toast notification
      } finally {
        isLoadingTaskData.value = false
      }
    }

    const handleRunTests = async () => {
      if (!task.value || !userSolution.value.trim() || isTestingSolution.value) {
        return
      }
      isTestingSolution.value = true
      isTestingGutterActive.value = true // Activate gutter animation
      if (gutterTimeoutId) clearTimeout(gutterTimeoutId)
      testResults.value = [] // Clear previous results or set to processing

      try {
        // Simulate API call to run tests
        // const response = await apiClient.post(`/tasks/${task.value.id}/test`, {
        //   solution: userSolution.value,
        //   language: task.value.language,
        // });
        // testResults.value = response.data.results.map((r: any, index: number) => ({ ...r, id: `test-${index}-${Date.now()}` }));

        // Mock results for demonstration
        console.log(`Running tests for task ${task.value.id} with language ${taskLanguage}`)
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))
        const mockResults: TestResult[] = [
          {
            id: 'res1',
            name: 'Test Case 1: Basic Input',
            status: Math.random() > 0.3 ? 'SUCCESS' : 'FAIL',
            message: Math.random() > 0.3 ? undefined : 'Expected "Hello" but got "World"',
          },
          { id: 'res2', name: 'Test Case 2: Edge Case', status: 'PROCESSING' },
          { id: 'res3', name: 'Test Case 3: Large Input', status: 'PENDING' },
        ]
        testResults.value = mockResults

        // Simulate a processing test finishing
        setTimeout(() => {
          const processingTest = testResults.value.find((r) => r.status === 'PROCESSING')
          if (processingTest) processingTest.status = Math.random() > 0.2 ? 'SUCCESS' : 'FAIL'
          const pendingTest = testResults.value.find((r) => r.status === 'PENDING')
          if (pendingTest) pendingTest.status = 'PROCESSING' // Move to processing
          setTimeout(() => {
            const stillProcessing = testResults.value.find((r) => r.status === 'PROCESSING')
            if (stillProcessing) stillProcessing.status = 'SUCCESS'
          }, 1000)
        }, 1500)
      } catch (error) {
        console.error('Error running tests:', error)
        testResults.value = [
          { id: 'err', name: 'System Error', status: 'FAIL', message: 'Could not run tests.' },
        ]
      } finally {
        isTestingSolution.value = false
        // Start dimming gutter after a short delay or after tests truly finish
        gutterTimeoutId = window.setTimeout(() => {
          isTestingGutterActive.value = false
        }, 1000)
      }
    }

    const handleResetCode = () => {
      if (confirm('Are you sure you want to reset your solution to the initial code?')) {
        userSolution.value = task.value?.prototype || ''
        solutionEditorPanelRef.value?.focusEditor()
      }
    }

    const handleAddToFavorites = async () => {
      if (!task.value) return
      try {
        // const response = await apiClient.post(`/tasks/${task.value.id}/favorite`);
        // isTaskFavorited.value = response.data.isFavorited;
        isTaskFavorited.value = !isTaskFavorited.value // Toggle for demo
        alert(isTaskFavorited.value ? 'Added to favorites!' : 'Removed from favorites!')
      } catch (error) {
        console.error('Failed to update favorite status:', error)
        alert('Could not update favorite status.')
      }
    }

    const goToDashboard = () => {
      router.push('/dashboard')
    }

    // --- Lifecycle Hooks ---
    onMounted(() => {
      fetchTaskDetails()
    })

    return {
      task,
      isLoadingTaskData,
      userSolution,
      testResults,
      isTestingSolution,
      isSubmittingSolution, // For future "Submit" button
      isTaskFavorited,
      isTestingGutterActive,
      taskLanguage,
      handleRunTests,
      handleResetCode,
      handleAddToFavorites,
      solutionEditorPanelRef,
      goToDashboard,
    }
  },
})
</script>

<style scoped>
.solve-task-view {
  padding: var(--padding-standard, 1rem);
  background-color: var(--color-background-dark);
  min-height: calc(100vh - 15vh); /* Adjust based on actual header height */
  /*height: 100%;*/
  box-sizing: border-box;
  font-family: var(--font-family-monospace);
  width: 100%;
  justify-self: center;
}

.view-loading-state,
.view-error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: var(--color-text-primary);
  font-size: 1.2rem;
  text-align: center;
}

.view-error-state .base-button {
  margin-top: 1.5rem;
}

.solve-task-grid-layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* Panel | Gutter | Panel */
  grid-template-rows: 1fr auto 1fr; /* Description/Solution | H-Gutter | Examples/Tests */
  /* The 1fr on last row helps examples/tests fill height */
  gap: 0; /* Gutters provide visual spacing */
  height: calc(100vh - 15vh - (2 * var(--padding-standard, 1rem))); /* Full available height */
  /*height: 100%;*/
  /*max-width: 1800px; /* Max width for the content */
  margin: 0 auto; /* Center the layout */
  position: relative; /* For positioning of gutters if needed, though grid handles it */
  padding: 0.5rem;
}

.panel {
  /* border is handled by ContentBox or specific panel styles */
  padding: var(--padding-standard, 0.8rem); /* Internal padding for panels */
  /*overflow: auto; /* Allow individual panels to scroll if their content overflows */
  /*background-color: var(--color-background-dark); /* Ensure panels have bg */
  display: flex; /* Make panels flex containers for their children */
  flex-direction: column;
  position: relative; /* For z-index context */
  z-index: 1; /* Panels above gutters */
}

/* Panels should try to fill their grid area */
.description-panel,
.solution-panel,
.examples-panel,
.tests-panel {
  height: 100%;
  box-sizing: border-box;
}

.gutter {
  /* RunicGutter component will define its own thickness via props */
  /* Ensure it's behind panels if there's any visual overlap due to borders */
  position: relative;
  z-index: 0;
  background-color: var(--color-background-dark); /* Match overall gutter area bg */
}

/* Grid area assignments */
.description-panel {
  grid-area: 1 / 1 / 2 / 2;
}

.vertical-gutter {
  grid-area: 1 / 2 / 4 / 3;
}

/* Spans all 3 effective rows in middle col */
.solution-panel {
  grid-area: 1 / 3 / 2 / 4;
}

.horizontal-gutter {
  grid-area: 2 / 1 / 3 / 4; /* Spans all columns in middle row */
  /* Height is set by RunicGutter's thickness prop */
}

.examples-panel {
  grid-area: 3 / 1 / 4 / 2;
}

.tests-panel {
  grid-area: 3 / 3 / 4 / 4;
}

/* Responsive adjustments */
@media (max-width: 1100px) {
  /* Adjust breakpoint as needed */
  .solve-task-grid-layout {
    grid-template-columns: 1fr; /* Stack all panels */
    grid-template-rows: auto auto auto auto auto auto auto; /* One row per element */
    height: auto; /* Allow height to grow */
    border: none;
    padding: 0;
  }

  .panel {
    min-height: 200px; /* Give panels some min height when stacked */
    margin-bottom: var(--padding-standard, 1rem);
    border: 1px solid var(--color-border-primary); /* Add borders when stacked */
  }

  .panel:last-child {
    margin-bottom: 0;
  }

  .gutter {
    display: none; /* Hide gutters on small screens */
  }

  /* Re-assign grid areas for stacked layout */
  .description-panel {
    grid-area: 1 / 1 / 2 / 2;
  }

  .solution-panel {
    grid-area: 2 / 1 / 3 / 2;
  }

  .examples-panel {
    grid-area: 3 / 1 / 4 / 2;
  }

  .tests-panel {
    grid-area: 4 / 1 / 5 / 2;
  }

  /* Hide gutters by not assigning them or setting display: none */
  .vertical-gutter,
  .horizontal-gutter {
    display: none;
  }
}
</style>
