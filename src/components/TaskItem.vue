<template>
  <div
    class="task-item"
    :class="{ 'is-clickable': clickable }"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
    :tabindex="clickable ? 0 : -1"
    role="listitem"
    :aria-label="`Task: ${task.name}`"
  >
    <div class="task-item__header">
      <h3 class="task-name">{{ task.name }}</h3>
      <!-- Optional: Add a small icon or indicator here if needed -->
    </div>
    <div class="task-item__details">
      <TagDisplay
        v-if="task.rank"
        :text="`Rank #${task.rank.number+1} ${task.rank.name}`"
        :backgroundColor="rankBackgroundColor"
        :textColor="rankTextColor"
        class="task-tag"
      />
      <TagDisplay
        v-if="task.language"
        :text="task.language.name"
        :backgroundColor="languageBackgroundColor"
        :textColor="languageTextColor"
        class="task-tag"
      />
      <!-- Add more tags or details here if needed -->
<!--      <span v-if="task.rank" class="task-difficulty">Rank #{{task.rank.number}}: {{ task.rank.name }}</span>-->
    </div>
    <!-- Optional: Slot for extra actions or information -->
    <div class="task-item__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TagDisplay from './TagDisplay.vue';
import type { TaskDto } from '@/types/defs/tasks/task.dto.ts' // Adjust path if needed


export default defineComponent({
  name: 'TaskItem',
  components: {
    TagDisplay,
  },
  props: {
    /**
     * The task object containing details to display.
     */
    task: {
      type: Object as PropType<TaskDto>,
      required: true,
    },
    /**
     * If true, the task item will have hover effects and emit a 'select' event on click.
     */
    clickable: {
      type: Boolean,
      default: false,
    },
    /**
     * Custom background color for the rank tag. Defaults to primary green.
     */
    rankBackgroundColor: {
      type: String,
      default: 'var(--color-primary-green)'
    },
    /**
     * Custom text color for the rank tag. Defaults to text-on-primary.
     */
    rankTextColor: {
      type: String,
      default: 'var(--color-text-on-primary)'
    },
    /**
     * Custom background color for the language tag. Defaults to primary green.
     */
    languageBackgroundColor: {
      type: String,
      default: 'var(--color-primary-green)'
    },
    /**
     * Custom text color for the language tag. Defaults to text-on-primary.
     */
    languageTextColor: {
      type: String,
      default: 'var(--color-text-on-primary)'
    }
  },
  emits: {
    /**
     * Emitted when a clickable task item is selected.
     * Payload is the ID of the selected task.
     */
    'select': (taskToken: string | number) => true,
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit('select', this.task.token);
      }
    },
  },
});
</script>

<style scoped>
.task-item {
  display: flex;
  flex-direction: column; /* Stack header and details */
  padding: var(--padding-standard, 1rem);
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-dark); /* Or a slightly lighter shade for item bg */
  border-radius: var(--border-radius, 4px);
  color: var(--color-text-primary);
  font-family: var(--font-family-monospace);
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  position: relative; /* For potential absolute positioned elements inside */
}

.task-item.is-clickable {
  cursor: pointer;
}

.task-item.is-clickable:hover,
.task-item.is-clickable:focus {
  /* background-color: rgba(var(--color-primary-green-rgb, 1, 255, 0), 0.05); */ /* Subtle hover */
  /* You'll need to define --color-primary-green-rgb or use a pre-calculated rgba */
  background-color: #0a140a; /* Example slightly lighter dark green */
  border-color: var(--color-primary-green); /* Highlight border on hover */
  outline: none;
}

.task-item__header {
  margin-bottom: 0.5rem;
}

.task-name {
  font-size: 1.1rem; /* Adjust as needed */
  font-weight: normal; /* Or bold if preferred */
  color: var(--color-text-primary); /* Or --color-primary-green for emphasis */
  margin: 0;
  line-height: 1.3;
  /* Truncate long names if necessary */
  /* white-space: nowrap; */
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
}

.task-item__details {
  display: flex;
  flex-wrap: wrap; /* Allow tags to wrap on smaller widths */
  gap: 0.5rem; /* Space between tags */
  align-items: center;
}

.task-tag {
  /* TagDisplay component handles its own styling, but you can add margin here */
  /* margin-right: 0.5rem; */
}

.task-difficulty {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-left: auto; /* Push difficulty to the right if space allows */
  padding-left: 0.5rem;
}

.task-item__actions {
  margin-top: 0.5rem; /* Space if actions are present */
  /* Example: align actions to the right */
  /* display: flex; */
  /* justify-content: flex-end; */
}
</style>
