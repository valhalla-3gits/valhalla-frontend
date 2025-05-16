<template>
  <div class="task-list-container">
    <div v-if="isLoading" class="loading-state">
      Loading tasks...
      <!-- Optional: Add a spinner component here -->
    </div>
    <div v-else-if="tasks.length === 0 && !isLoading" class="empty-state">
      No tasks match your criteria.
    </div>
    <ul v-else class="task-list-ul" role="list">
      <li v-for="task in tasks" :key="task.token" class="task-list-item">
        <TaskItem
          :task="task"
          :clickable="isTaskClickable"
          @select="handleTaskSelect"
          :rankBackgroundColor="getRankColor(task.rank.name)"
          :languageBackgroundColor="getLanguageColor(task.language.name)"
          :languageTextColor="getLanguageTextColor(task.language.name)"
        >
          <!-- Example: Slot for actions if needed for specific task types -->
          <!-- <template #actions v-if="task.canBeFavorited">
            <BaseButton
                icon="far fa-star"
                styleType="outlined"
                @click.stop="toggleFavorite(task.id)"
                aria-label="Toggle favorite"
            />
          </template> -->
        </TaskItem>
      </li>
    </ul>
    <div v-if="hasMore && !isLoading" class="load-more-container">
      <BaseButton
        text="Load More"
        styleType="outlined"
        @click="emitLoadMore"
        :disabled="isFetchingMore"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TaskItem from './TaskItem.vue'; // Adjust path
import BaseButton from './BaseButton.vue';
import type { TaskDto } from '@/types/defs/tasks/task.dto.ts' // Adjust path if you use it for "Load More"

export default defineComponent({
  name: 'TaskList',
  components: {
    TaskItem,
    BaseButton, // Register if used
  },
  props: {
    /**
     * An array of task objects to display.
     */
    tasks: {
      type: Array as PropType<TaskDto[]>,
      required: true,
    },
    /**
     * Indicates if the tasks are currently being loaded (e.g., initial load).
     */
    isLoading: {
      type: Boolean,
      default: false,
    },
    /**
     * Indicates if individual task items should be clickable.
     */
    isTaskClickable: {
      type: Boolean,
      default: true, // Often tasks in a list are clickable
    },
    /**
     * Indicates if there are more tasks to load (for pagination/infinite scroll).
     */
    hasMore: {
      type: Boolean,
      default: false,
    },
    /**
     * Indicates if "load more" action is in progress.
     */
    isFetchingMore: {
      type: Boolean,
      default: false,
    }
  },
  emits: {
    /**
     * Emitted when a clickable task item is selected.
     * Payload is the ID of the selected task.
     */
    'task-select': (taskToken: string | number) => true,
    /**
     * Emitted when the "Load More" button is clicked.
     */
    'load-more': () => true,
  },
  methods: {
    handleTaskSelect(taskToken: string | number) {
      this.$emit('task-select', taskToken);
    },
    emitLoadMore() {
      this.$emit('load-more');
    },

    // Optional: Example methods to dynamically determine tag colors
    // You can make these more sophisticated based on your needs
    getRankColor(rank?: string | number): string {
      // Example: Different color for high ranks
      // if (rank && (typeof rank === 'string' ? parseInt(rank, 10) > 3 : rank > 3)) {
      //   return 'var(--color-accent-blue, blue)'; // Define --color-accent-blue in main.css
      // }
      return 'var(--color-primary-green)'; // Default
    },
    getLanguageColor(language?: string): string {
      // Example: Specific colors for certain languages
      // switch (language?.toLowerCase()) {
      //   case 'python': return 'var(--color-python-yellow, yellow)';
      //   case 'javascript': return 'var(--color-js-orange, orange)';
      //   default: return 'var(--color-primary-green)';
      // }
      return 'var(--color-primary-green)'; // Default
    },
    getLanguageTextColor(language?: string): string {
      // Example: Ensure text contrast for specific language background colors
      // if (language?.toLowerCase() === 'python') {
      //   return 'black';
      // }
      return 'var(--color-text-on-primary)'; // Default
    }
  },
});
</script>

<style scoped>
.task-list-container {
  width: 100%;
  font-family: var(--font-family-monospace);
}

.loading-state,
.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-primary);
  opacity: 0.7;
  font-size: 1rem;
  border: 1px dashed var(--color-border-primary); /* Optional visual cue */
  border-radius: var(--border-radius, 4px);
}

.task-list-ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--padding-standard, 1rem); /* Space between task items */
}

.task-list-item {
  /* Individual list item styling if needed, though TaskItem handles most of it */
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: var(--padding-standard, 1rem);
}
</style>
