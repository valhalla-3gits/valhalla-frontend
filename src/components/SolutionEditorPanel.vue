<template>
  <ContentBox
    title="Your Solution"
    class="solution-editor-panel-box"
    :useInternalTitleStyle="false"
  >
    <!-- If ContentBox title prop is used, useInternalTitleStyle might be false to allow custom h2 -->
    <!-- Or, remove title from ContentBox and use h2 directly if ContentBox is just for border/padding -->
    <!-- <h2 class="panel-title">Your Solution</h2> -->

    <div class="editor-container">
      <CodeEditorInput
        :modelValue="modelValue"
        @update:modelValue="emitCodeChange"
        :language="language"
        :placeholder="editorPlaceholder"
        :editorHeight="editorHeight"
        :readOnly="readOnly"
        :autofocus="autofocus"
        :tabSize="tabSize"
        ref="codeEditorRef"
      />
    </div>
    <div v-if="showFooterActions" class="panel-footer-actions">
      <BaseButton
        text="Reset Code"
        styleType="outlined"
        @click="emitResetCode"
        :disabled="readOnly"
      />
      <!-- Add other actions like "Submit Solution" if this panel handles submission -->
    </div>
  </ContentBox>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import ContentBox from './ContentBox.vue' // Adjust path
import CodeEditorInput from './CodeEditorInput.vue' // Adjust path
import BaseButton from './BaseButton.vue' // Adjust path (if using footer actions)

type SupportedEditorLanguage = 'javascript' | 'python' | 'cpp' | 'c' | 'rust' | 'typescript' | 'plaintext';

export default defineComponent({
  name: 'SolutionEditorPanel',
  components: {
    ContentBox,
    CodeEditorInput,
    BaseButton,
  },
  props: {
    /**
     * The current code solution (for v-model).
     */
    modelValue: {
      type: String,
      required: true,
    },
    /**
     * The programming language for syntax highlighting.
     */
    language: {
      type: String as PropType<SupportedEditorLanguage>,
      default: 'plaintext',
    },
    /**
     * Placeholder text for the code editor.
     */
    editorPlaceholder: {
      type: String,
      default: '// Start typing your solution here...',
    },
    /**
     * Height of the code editor.
     */
    editorHeight: {
      type: String,
      default: '20vh', // Example: try to fill available space minus padding
      // Or a fixed height like '400px'
    },
    /**
     * Makes the editor read-only.
     */
    readOnly: {
      type: Boolean,
      default: false,
    },
    /**
     * Autofocus the editor on mount.
     */
    autofocus: {
      type: Boolean,
      default: false, // Usually false, parent might control focus
    },
    /**
     * Tab size for the editor.
     */
    tabSize: {
      type: Number,
      default: 2,
    },
    /**
     * Whether to show footer actions like a "Reset Code" button.
     */
    showFooterActions: {
      type: Boolean,
      default: false, // Example: default to false, enable if needed
    },
  },
  emits: {
    /**
     * Emitted when the code changes (for v-model).
     */
    'update:modelValue': (code: string) => typeof code === 'string',
    /**
     * Emitted when the "Reset Code" button is clicked.
     */
    'reset-code': () => true,
    // Add other emits like 'submit-solution' if this panel handles it
  },
  setup(props, { emit }) {
    const codeEditorRef = ref<InstanceType<typeof CodeEditorInput> | null>(null)

    const emitCodeChange = (code: string) => {
      emit('update:modelValue', code)
    }

    const emitResetCode = () => {
      emit('reset-code')
    }

    // Method to focus the editor, can be called by parent using a ref
    const focusEditor = () => {
      codeEditorRef.value?.view?.focus() // Access CodeMirror's view instance if exposed
    }

    return {
      emitCodeChange,
      emitResetCode,
      codeEditorRef,
      focusEditor,
    }
  },
})
</script>

<style scoped>
.solution-editor-panel-box {
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
  display: flex; /* Allow editor and footer to be flex items */
  flex-direction: column;
  height: 100%; /* Important for editorHeight: '100%' to work within this panel */
  /* ContentBox provides main border. Adjust internal padding if needed. */
  /* padding: 0.5rem; */ /* Example of smaller internal padding */
}

/* If not using ContentBox title prop, or want to override */
.panel-title {
  font-size: 1.1rem; /* Match other panel titles */
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 0 0 0.8rem 0; /* Space below title */
  padding: 0 0.5rem; /* Align with ContentBox internal padding if used */
}

.editor-container {
  flex-grow: 1; /* Allow CodeEditorInput to take available vertical space */
  /*width: 100%;*/
  /* The CodeEditorInput's wrapper will handle its own height based on editorHeight prop */
  /* Ensure CodeEditorInput itself is styled to fill this container if editorHeight is relative */
  min-height: 150px; /* Minimum height for the editor area */
  overflow: auto;
}

.panel-footer-actions {
  padding-top: 0.8rem;
  margin-top: 0.8rem; /* Space above footer actions */
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2);
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 0.8rem;
}
</style>
