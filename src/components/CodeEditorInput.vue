<template>
  <div class="code-editor-input-wrapper" :style="{ height: editorHeight }">
    <Codemirror
      v-model="internalCode"
      :placeholder="placeholder"
      :style="{ height: '100%', width: '100%' }"
      :autofocus="autofocus"
      :indent-with-tab="false"
      :tab-size="tabSize"
      :extensions="extensions"
      :disabled="disabled || readOnly"
      @ready="handleReady"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, shallowRef } from 'vue'
import type {PropType} from 'vue'
import { Codemirror } from 'vue-codemirror'
import { EditorView, } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
// import { indentWithTab } from '@codemirror/commands'

// Language Support
import { javascript, javascriptLanguage, typescriptLanguage } from '@codemirror/lang-javascript'
import { python, pythonLanguage } from '@codemirror/lang-python'
import { cpp, cppLanguage } from '@codemirror/lang-cpp' // cppLanguage also supports C
import { rust, rustLanguage } from '@codemirror/lang-rust'

// Theme
// import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark'


// Basic Setup (optional, but good for line numbers, etc.)
import { basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark' // Provides a good set of default extensions

// Define supported language types
type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp' | 'c' | 'rust' | 'plaintext'

export default defineComponent({
  name: 'CodeEditorInput',
  components: {
    Codemirror,
  },
  props: {
    scroll: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
    language: {
      type: String as PropType<SupportedLanguage>,
      default: 'plaintext', // Default to no specific highlighting
    },
    placeholder: {
      type: String,
      default: 'Enter your code here...',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    tabSize: {
      type: Number,
      default: 2,
    },
    editorHeight: {
      type: String,
      default: '200px', // Default height, can be overridden
    },
    // You can add more props for other CodeMirror configurations
  },
  emits: ['update:modelValue', 'ready', 'change', 'focus', 'blur'],

  setup(props, { emit }) {
    const internalCode = ref(props.modelValue)
    const view = shallowRef<EditorView>() // To store the CodeMirror view instance

    // Sync modelValue with internalCode
    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== internalCode.value) {
          internalCode.value = newValue
        }
      },
    )

    const getLanguageExtension = () => {
      switch (props.language.toLowerCase()) {
        case 'javascript':
          return javascript({ jsx: false, typescript: false }) // Specify no jsx/ts for pure JS
        case 'typescript':
          return javascript({ jsx: false, typescript: true }) // Enable TS support in JS extension
        case 'python':
          return python()
        case 'cpp':
          return cpp() // C++ language support
        case 'c':
          return cpp() // C is typically handled by the C++ language package
        case 'rust':
          return rust()
        case 'plaintext':
        default:
          return [] // No specific language extension
      }
    }

    const extensions = computed(() => {
      const langExtension = getLanguageExtension()
      const baseExtensions = [
        // basicSetup, // Includes many useful things like line numbers, history, etc.
        // OR, pick and choose from basicSetup if you want more control:
        EditorView.lineWrapping, // Optional: enable line wrapping
        EditorState.tabSize.of(props.tabSize),
        oneDark,
        // keymap.of([indentWithTab]), // Use Tab key for indentation
        // gruvboxDark, // Apply the theme

      ]

      if (props.scroll) {
        baseExtensions.push()
      }

      if (Array.isArray(langExtension)) {
        // For plaintext or if getLanguageExtension returns an array
        return [...baseExtensions, ...langExtension]
      } else {
        // For specific language objects
        return [...baseExtensions, langExtension]
      }
    })

    const handleReady = (payload: {
      view: EditorView
      state: EditorState
      container: HTMLDivElement
    }) => {
      view.value = payload.view
      emit('ready', payload)
    }

    const handleChange = (value: string, viewUpdate: any) => {
      internalCode.value = value // Update internal state
      emit('update:modelValue', value)
      emit('change', value, viewUpdate)
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    return {
      internalCode,
      extensions,
      handleReady,
      handleChange,
      handleFocus,
      handleBlur,
      view, // Expose view if you need to interact with CM instance from parent
    }
  },
})
</script>

<style>
/* Global styles for CodeMirror - not scoped, as CM appends to body or needs global reach */
/* You might want to place these in a global CSS file if you prefer */

.cm-editor {
  border: 1px solid var(--color-border-primary); /* Use your theme's border color */
  /*border-radius: var(--border-radius, 4px); /* Use your theme's border radius */
  font-family: var(--font-family-monospace) !important; /* Ensure your monospace font is used */
  font-size: 0.9rem; /* Adjust as needed */
  outline: none !important; /* Remove default outline on focus */
}

.cm-editor.cm-focused {
  /* border-color: var(--color-primary-green); */ /* Optional: Highlight border on focus */
  /* box-shadow: 0 0 3px var(--color-primary-green); */ /* Optional: Glow effect */
}

.cm-gutters {
  background-color: var(--color-background-dark, #282828) !important; /* Match theme's gutter bg */
  border-right: 1px solid var(--gruvbox-dark-gutter-border, #3c3836) !important; /* Match theme's gutter border */
  color: var(--color-text-primary, #a89984) !important; /* Match theme's gutter text color */
}

.cm-content {
  caret-color: var(--gruvbox-dark-cursor, #fbf1c7) !important; /* Match theme's cursor color */
}

.cm-placeholder {
  color: #7c6f64 !important; /* Gruvbox dark placeholder color (example) */
  font-style: italic;
}

/* Ensure the vue-codemirror wrapper takes full height */
.code-editor-input-wrapper {
  width: 100%;
  /* height is set by prop */
}

.code-editor-input-wrapper > div {
  /* Targets the direct child div from vue-codemirror */
  height: 100% !important;
}

/* If using basicSetup and want to style the active line */
.cm-activeLine {
  background-color: var(--gruvbox-dark-activeline-bg, #3c3836) !important;
}

.cm-activeLineGutter {
  background-color: var(--gruvbox-dark-activeline-bg, #3c3836) !important;
}
</style>
