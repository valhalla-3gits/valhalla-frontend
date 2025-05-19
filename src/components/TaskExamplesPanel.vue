<template>
  <ContentBox title="Examples" class="task-examples-panel-box">
    <div class="panel-content">
      <div v-if="examplesMarkdown && examplesMarkdown.trim() !== ''" class="markdown-content" v-html="renderedExamplesHtml"></div>
      <div v-else class="empty-state-examples">
        No examples provided for this task.
      </div>
    </div>
  </ContentBox>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import ContentBox from './ContentBox.vue';   // Adjust path
import { marked } from 'marked';             // For Markdown rendering
import DOMPurify from 'dompurify';           // For sanitizing HTML

export default defineComponent({
  name: 'TaskExamplesPanel',
  components: {
    ContentBox,
  },
  props: {
    /**
     * A string containing Markdown formatted examples.
     */
    examplesMarkdown: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const renderedExamplesHtml = computed(() => {
      if (!props.examplesMarkdown) return '';
      // Convert Markdown to HTML
      const rawHtml = marked.parse(props.examplesMarkdown, {
        gfm: true,        // Enable GitHub Flavored Markdown
        breaks: true,     // Convert single line breaks to <br>
        // Consider adding a syntax highlighter for code blocks within markdown if needed
        // highlight: function (code, lang) {
        //   const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        //   return hljs.highlight(code, { language }).value;
        // }
      }) as string;

      // Sanitize the HTML to prevent XSS attacks
      return DOMPurify.sanitize(rawHtml);
    });

    return {
      renderedExamplesHtml,
    };
  },
});
</script>

<style scoped>
.task-examples-panel-box {
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
  /* ContentBox provides main border. */
}

.panel-content {
  /* Add specific padding for example content if ContentBox padding is not ideal */
  /* padding: 0.5rem; */
}

.empty-state-examples {
  padding: 1rem;
  text-align: center;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Styles for rendered Markdown content */
/* These styles should ideally be shared with TaskDescriptionPanel if they are identical.
   You could extract them to a global style or a mixin if using SCSS.
   For simplicity, they are duplicated here but marked for potential refactoring.
   Ensure these :deep selectors work with your Vue setup for scoped styles.
*/
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: var(--color-primary-green);
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
  line-height: 1.3;
}
.markdown-content :deep(h1) { font-size: 1.4em; }
.markdown-content :deep(h2) { font-size: 1.3em; }
.markdown-content :deep(h3) { font-size: 1.2em; }
.markdown-content :deep(h4) { font-size: 1.1em; }

.markdown-content :deep(p) {
  margin-bottom: 0.8em;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 0.8em;
  padding-left: 0.5em; /* For custom list markers or spacing */
}
.markdown-content :deep(li) {
  margin-bottom: 0.3em;
  line-height: 1.6;
}

.markdown-content :deep(code) {
  background-color: rgba(var(--color-background-dark-rgb, 5, 12, 5), 0.7);
  padding: 0.2em 0.4em;
  font-size: 0.9em; /* Slightly smaller for inline code */
  border: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.3);
  color: var(--color-text-primary); /* Ensure text color is readable */
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--color-background-dark-rgb, 5, 12, 5), 0.8); /* Darker for block */
  padding: 0.8em;
  overflow-x: auto; /* Scroll for long code blocks */
  border: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.4);
  margin-bottom: 1em;
}
.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border: none;
  font-size: 0.9em; /* Consistent code font size */
  color: var(--color-text-primary);
  white-space: pre; /* Preserve whitespace strictly in pre blocks */
}

.markdown-content :deep(a) {
  color: var(--color-primary-green);
  text-decoration: underline;
}
.markdown-content :deep(a:hover) {
  opacity: 0.8;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--color-primary-green);
  padding-left: 1em;
  margin-left: 0; /* Override default browser margin */
  margin-right: 0;
  color: var(--color-text-primary);
  opacity: 0.9;
  font-style: italic;
  margin-bottom: 1em;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(var(--color-primary-green), 0.2);
  margin: 1.5em 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
  font-size: 0.9rem;
}
.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgba(var(--color-primary-green), 0.3);
  padding: 0.5em 0.7em;
  text-align: left;
}
.markdown-content :deep(th) {
  background-color: rgba(var(--color-primary-green), 0.1);
  color: var(--color-primary-green);
  font-weight: bold;
}
</style>
