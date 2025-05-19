<template>
  <ContentBox :title="title || 'Task Description'" class="task-description-panel-box">
    <div class="panel-content">
      <h2 v-if="taskTitle" class="task-title-main">{{ taskTitle }}</h2>

      <div v-if="description" class="description-section markdown-content" v-html="renderMarkdown(description)"></div>
      <div v-else class="empty-description">No description provided.</div>

      <div v-if="showAddToFavourites" class="actions-footer">
        <BaseButton
          text="+ Add To Favourites"
          styleType="outlined"
          @click="emitAddToFavourites"
          class="add-to-favourites-button"
        >
          <template #icon>
            <i class="fas fa-plus" style="margin-right: 0.5em;"></i>
          </template>
        </BaseButton>
      </div>
    </div>
  </ContentBox>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type {PropType} from 'vue';
import ContentBox from './ContentBox.vue';   // Adjust path
import BaseButton from './BaseButton.vue';   // Adjust path
import { marked } from 'marked';             // For Markdown rendering
import DOMPurify from 'dompurify';           // For sanitizing HTML from Markdown

export default defineComponent({
  name: 'TaskDescriptionPanel',
  components: {
    ContentBox,
    BaseButton,
  },
  props: {
    /**
     * Optional title for the ContentBox wrapper.
     * If not provided, defaults to "Task Description".
     */
    title: {
      type: String,
      default: null, // Let ContentBox use its default or be overridden by a h2
    },
    /**
     * The main title of the task, displayed prominently.
     */
    taskTitle: {
      type: String,
      default: '',
    },
    /**
     * Optional subtitle or tagline for the task.
     */
    subtitle: {
      type: String,
      default: '',
    },
    /**
     * The main description of the task. Can contain Markdown.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Additional notes for the task. Can contain Markdown.
     */
    notes: {
      type: String,
      default: '',
    },
    /**
     * Whether to show the "Add To Favourites" button.
     */
    showAddToFavourites: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['add-to-favourites'],
  methods: {
    renderMarkdown(markdownText: string): string {
      if (!markdownText) return '';
      // Convert Markdown to HTML
      const rawHtml = marked.parse(markdownText, {
        gfm: true,        // Enable GitHub Flavored Markdown
        breaks: true,     // Convert single line breaks to <br>
        // smartLists: true,
        // smartypants: true,
      }) as string; // Cast because marked.parse can return Promise if async is true

      // Sanitize the HTML to prevent XSS attacks
      return DOMPurify.sanitize(rawHtml);
    },
    emitAddToFavourites() {
      this.$emit('add-to-favourites');
    },
  },
});
</script>

<style scoped>
.task-description-panel-box {
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
  /* ContentBox provides main border. Internal padding can be adjusted if needed. */
  /* Example: if ContentBox has too much padding for this content */
  /* padding: 0.8rem 1rem; */
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Space between title, description, notes, and button */
  overflow: auto;
}

.task-title-main {
  font-size: 1.3rem; /* Prominent task title */
  font-weight: bold;
  color: var(--color-text-primary); /* Or #fff for brighter */
  margin: 0 0 0.2rem 0;
  line-height: 1.3;
}

.task-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  opacity: 0.8;
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
  font-style: italic;
}

.description-section,
.notes-section .markdown-content { /* Target markdown content within notes */
  line-height: 1.6;
  font-size: 0.95rem;
}

.empty-description {
  opacity: 0.7;
  font-style: italic;
}

.notes-section {
  margin-top: 0.5rem; /* Add some space before notes if description is present */
  padding-top: 0.8rem;
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2); /* Fainter separator */
}

.notes-heading {
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-primary-green);
  margin: 0 0 0.5rem 0;
}

/* Styles for rendered Markdown content */
/* These styles should be global if you use markdown elsewhere,
   or duplicated/scoped carefully. For simplicity, scoped here. */
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
}
.markdown-content :deep(h1) { font-size: 1.4em; }
.markdown-content :deep(h2) { font-size: 1.3em; } /* Match .task-title-main if it's the primary heading */
.markdown-content :deep(h3) { font-size: 1.2em; }
.markdown-content :deep(h4) { font-size: 1.1em; } /* Match .notes-heading */


.markdown-content :deep(p) {
  margin-bottom: 0.8em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 0.8em;
  padding-left: 0.5em;
}
.markdown-content :deep(li) {
  margin-bottom: 0.3em;
}

.markdown-content :deep(code) {
  background-color: rgba(var(--color-background-dark-rgb, 5, 12, 5), 0.7);
  padding: 0.2em 0.4em;
  font-size: 0.9em;
  border: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.3);
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--color-background-dark-rgb, 5, 12, 5), 0.8);
  padding: 0.8em;
  overflow-x: auto; /* Scroll for long code blocks */
  border: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.4);
}
.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border: none;
  font-size: 0.9em;
}

.markdown-content :deep(a) {
  color: var(--color-primary-green); /* Use theme link color */
  text-decoration: underline;
}
.markdown-content :deep(a:hover) {
  opacity: 0.8;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--color-primary-green);
  padding-left: 1em;
  margin-left: 0;
  margin-right: 0;
  color: var(--color-text-primary);
  opacity: 0.9;
  font-style: italic;
}

.actions-footer {
  margin-top: auto; /* Push to bottom if content is short */
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2);
  display: flex;
  justify-content: flex-start; /* Or center/flex-end */
}

.add-to-favourites-button {
  /* BaseButton handles its style */
}
.add-to-favourites-button i { /* For Font Awesome icon */
  font-size: 0.9em;
}
</style>
