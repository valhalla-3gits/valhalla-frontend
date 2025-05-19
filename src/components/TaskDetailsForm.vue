<template>
  <div class="task-details-form">
    <ContentBox title="Create Task" :useInternalTitleStyle="false" class="form-section-box">
      <!-- Using false for useInternalTitleStyle if ContentBox has its own title style we don't want here -->
      <!-- Or remove title from ContentBox and use a h2 directly -->
      <!-- <h2 class="section-title">Create Task</h2> -->

      <div class="form-grid">
        <div class="form-group full-width">
          <label for="task-name">Task Name</label>
          <input
            id="task-name"
            type="text"
            :value="localTaskData.name"
            @input="updateField('name', ($event.target as HTMLInputElement).value)"
            placeholder="Enter task name"
            required
          />
          <!-- <IconButton iconClass="fas fa-pencil-alt" class="edit-icon-inline" /> -->
        </div>

        <div class="form-group">
          <label for="task-rank">Rank</label>
          <!-- Or dynamic: selectedRankLabel -->
          <DropdownFilter
            id="task-rank"
            :modelValue="localTaskData.rank_id"
            @update:modelValue="updateField('rank_id', $event)"
            :options="rankOptions"
            placeholder="Select Rank"
          />
        </div>

        <div class="form-group">
          <label for="task-language">Language</label>
          <!-- Or dynamic: selectedLanguageLabel -->
          <DropdownFilter
            id="task-language"
            :modelValue="localTaskData.language_id"
            @update:modelValue="updateField('language_id', $event)"
            :options="languageOptions"
            placeholder="Select Language"
          />
        </div>

        <div class="form-group full-width">
          <label for="task-description">Task Description</label>
          <textarea
            id="task-description"
            :value="localTaskData.description"
            @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
            placeholder="Detailed description of the task..."
            rows="5"
            required
          ></textarea>
          <!-- <IconButton iconClass="fas fa-pencil-alt" class="edit-icon-inline" /> -->
        </div>

        <div class="form-group full-width">
          <label for="task-example">Example <span class="field-hint">(Input/Output or usage example)</span></label>
          <textarea
            id="task-example"
            :value="localTaskData.output_examples"
            @input="updateField('output_examples', ($event.target as HTMLTextAreaElement).value)"
            placeholder="Provide an example..."
            rows="4"
          ></textarea>
          <!-- <IconButton iconClass="fas fa-pencil-alt" class="edit-icon-inline" /> -->
        </div>

        <div class="form-group full-width">
          <label for="task-prototype">
            Prototype / Initial Code <span class="field-hint">(Starter code for the user)</span>
          </label>
          <CodeEditorInput
            id="task-prototype"
            :modelValue="localTaskData.prototype"
            @update:modelValue="updateField('prototype', $event)"
            :language="selectedLanguageForEditor"
            placeholder="// Starter function or class structure..."
            editorHeight="200px"
          />
          <!-- <IconButton iconClass="fas fa-pencil-alt" class="edit-icon-inline" /> -->
        </div>
      </div>

      <div class="form-actions">
        <BaseButton
          text="+ Create Test"
          styleType="outlined"
          @click="emitCreateTest"
          class="create-test-button"
        >
          <template #icon>
            <i class="fas fa-plus" style="margin-right: 0.5em;"></i>
          </template>
        </BaseButton>
      </div>
    </ContentBox>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch, computed } from 'vue';
import ContentBox from './ContentBox.vue';       // Adjust path
import DropdownFilter, { type DropdownOption } from './DropdownFilter.vue'; // Adjust path
import CodeEditorInput from './CodeEditorInput.vue'; // Adjust path
import BaseButton from './BaseButton.vue';
import type { TestCaseData } from '@/components/TestCaseForm.vue'       // Adjust path
// import IconButton from './IconButton.vue';    // If using inline edit icons

// Define the structure for the task data this form manages
export interface TaskDetailsData {
  id?: string | number // Present in edit mode
  name: ''
  rank_id: null
  language_id: null
  description: ''
  output_examples: ''
  prototype: ''
  tests: TestCaseData[]
}

type SupportedEditorLanguage = 'javascript' | 'python' | 'cpp' | 'c' | 'rust' | 'typescript' | 'plaintext';


export default defineComponent({
  name: 'TaskDetailsForm',
  components: {
    ContentBox,
    DropdownFilter,
    CodeEditorInput,
    BaseButton,
    // IconButton,
  },
  props: {
    /**
     * Initial data for the task details form.
     * The parent component should manage this and update it via events.
     */
    initialData: {
      type: Object as PropType<TaskDetailsData>,
      required: true,
    },
    rankOptions: {
      type: Array as PropType<DropdownOption[]>,
      default: () => [],
    },
    languageOptions: {
      type: Array as PropType<DropdownOption[]>,
      default: () => [],
    },
  },
  emits: {
    /**
     * Emitted when any field in the task details data is updated.
     * Payload: { field: keyof TaskDetailsData, value: any }
     */
    'update-field': (payload: { field: keyof TaskDetailsData; value: any }) => true,
    /**
     * Emitted when the "+ Create Test" button is clicked.
     */
    'create-test': () => true,
  },
  setup(props, { emit }) {
    // Local reactive state, initialized from props
    // This allows for local changes before emitting, or if parent doesn't use v-model for each field
    const localTaskData = reactive<TaskDetailsData>({ ...props.initialData });

    // Watch for prop changes to update local state if parent updates the object
    watch(() => props.initialData, (newData) => {
      Object.assign(localTaskData, newData);
    }, { deep: true, immediate: true }); // immediate to sync on first load

    const updateField = (field: keyof TaskDetailsData, value: any) => {
      // Update local state first
      (localTaskData as any)[field] = value;
      // Then emit the change to the parent
      emit('update-field', { field, value });
    };

    const emitCreateTest = () => {
      emit('create-test');
    };

    // Computed property to map selected language ID to CodeEditorInput language string
    const selectedLanguageForEditor = computed((): SupportedEditorLanguage => {
      const selectedLangOption = props.languageOptions.find(
        opt => opt.value === localTaskData.languageId
      );
      if (selectedLangOption) {
        // This mapping depends on how your language names/IDs map to CodeMirror language modes
        const langLabel = selectedLangOption.label.toLowerCase();
        if (['javascript', 'python', 'cpp', 'c', 'rust', 'typescript'].includes(langLabel)) {
          return langLabel as SupportedEditorLanguage;
        }
        // Add more specific mappings if needed, e.g., 'csharp' -> 'csharp'
      }
      return 'plaintext'; // Default if no match or no language selected
    });


    return {
      localTaskData,
      updateField,
      emitCreateTest,
      selectedLanguageForEditor,
    };
  },
});
</script>

<style scoped>
.task-details-form {
  /* The ContentBox will provide the main border and padding */
  font-family: var(--font-family-monospace);
}

/* If not using ContentBox title, or want to override */
.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--padding-standard, 1rem);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-primary);
}

.form-grid {
  display: grid;
  gap: var(--padding-standard, 1rem);
  /* Example: 2 columns for Rank and Language, others full width */
  grid-template-columns: 1fr; /* Default to single column */
}

/* On wider screens, make Rank and Language side-by-side */
@media (min-width: 600px) { /* Adjust breakpoint as needed */
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
  .form-group.full-width {
    grid-column: 1 / -1; /* Span full width */
  }
}


.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Space between label and input */
  position: relative; /* For potential inline edit icons */
}

.form-group label {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-primary);
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.7em 0.9em;
  background-color: var(--color-background-dark); /* Or a slightly distinct input bg */
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box; /* Important for width and padding */
}

.form-group textarea {
  resize: vertical; /* Allow vertical resize */
  min-height: 80px;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary-green);
  /* box-shadow: 0 0 3px var(--color-primary-green); */
}

/* Style for DropdownFilter if it needs specific layout within this form */
.form-group .dropdown-filter-wrapper {
  width: 100%;
}

.field-hint {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: normal;
  /* margin-left: 0.5em; */ /* Handled by label being block */
}

/* Inline edit icon styling (if you add them back) */
.edit-icon-inline {
  position: absolute;
  top: 0.5em; /* Adjust to align with input/textarea top */
  right: 0.5em;
  /* IconButton should handle its own colors, or you can set them here */
  /* color: var(--color-primary-green); */
  opacity: 0.6;
  transition: opacity 0.2s;
}
.edit-icon-inline:hover {
  opacity: 1;
}
.form-group input[type="text"] ~ .edit-icon-inline,
.form-group textarea ~ .edit-icon-inline {
  /* Adjust top if label is present */
  top: calc(0.5em + 0.9rem + 0.4rem); /* input_padding + label_font_size + label_margin_bottom */
}


.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2);
  display: flex;
  justify-content: flex-start; /* Or center/flex-end */
}

.create-test-button {
  /* BaseButton handles its style, can add margin here */
}
.create-test-button i { /* For Font Awesome icon */
  font-size: 0.9em;
}
</style>
