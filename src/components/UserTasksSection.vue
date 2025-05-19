<template>
  <ContentBox title="Your Tasks" class="user-tasks-section-box">
    <div v-if="isLoading" class="loading-state">Loading your tasks...</div>
    <div v-else-if="!userTasks || userTasks.length === 0" class="empty-state">
      You haven't created any tasks yet.
      <BaseButton
        text="+ Create Task"
        styleType="filled"
        @click="emitCreateTask"
        class="create-task-button-empty"
      />
    </div>
    <div v-else class="tasks-table-container">
      <table class="tasks-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rank</th>
            <th>Language</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in userTasks" :key="task.token">
            <td data-label="Name">{{ task.name }}</td>
            <td data-label="Rank">{{ task.rank.name || 'N/A' }}</td>
            <td data-label="Language">{{ task.language.name || 'N/A' }}</td>
            <td data-label="Actions" class="actions-cell">
              <IconButton
                iconClass="nf nf-md-pencil"
                tooltip="Edit Task"
                @click="emitEditTask(task.token)"
                aria-label="Edit task"
              />
              <IconButton
                iconClass="nf nf-fa-trash"
                tooltip="Delete Task"
                @click="emitDeleteTask(task.token)"
                aria-label="Delete task"
                class="delete-icon"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <BaseButton
        text="+ Create Task"
        styleType="filled"
        @click="emitCreateTask"
        class="create-task-button-footer"
      />
    </div>
  </ContentBox>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ContentBox from './ContentBox.vue' // Adjust path
import BaseButton from './BaseButton.vue' // Adjust path
import IconButton from './IconButton.vue' // Adjust path
import type { TaskDto } from '@/types/defs/tasks/task.dto.ts' // Assuming TaskItem exports Task type

// Extend Task interface if specific fields like createdAt/updatedAt are needed

export default defineComponent({
  name: 'UserTasksSection',
  components: {
    ContentBox,
    BaseButton,
    IconButton,
  },
  props: {
    userTasks: {
      type: Array as PropType<TaskDto[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'create-task': () => true,
    'edit-task': (taskToken: string | number) => true,
    'delete-task': (taskToken: string | number) => true,
  },
  methods: {
    emitEditTask(taskToken: string | number) {
      this.$emit('edit-task', taskToken)
    },
    emitCreateTask() {
      this.$emit('create-task')
    },
    emitDeleteTask(taskToken: string | number) {
      this.$emit('delete-task', taskToken)
    },
  },
})
</script>

<style scoped>
.user-tasks-section-box {
  /* ContentBox already has padding, but you can override or add more if needed */
  /* padding: var(--padding-standard, 1rem); */
  font-family: var(--font-family-monospace);
}

.loading-state,
.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-primary);
  opacity: 0.7;
  font-size: 1rem;
}

.empty-state .create-task-button-empty {
  margin-top: 1.5rem;
}

.tasks-table-container {
  width: 100%;
  overflow-x: auto; /* Allow horizontal scrolling on small screens if table is wide */
}

.tasks-table {
  width: 100%;
  border-collapse: collapse; /* Removes space between cells */
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.tasks-table th,
.tasks-table td {
  padding: 0.75em 0.5em;
  text-align: left;
  border-bottom: 1px solid var(--color-border-primary);
}

.tasks-table th {
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary);
  font-weight: bold;
  cursor: pointer;
  user-select: none; /* Prevent text selection on header click */
  white-space: nowrap;
}

.tasks-table th:hover {
  opacity: 0.9;
}

.sortable-header .sort-arrow {
  display: inline-block;
  margin-left: 0.3em;
  opacity: 0.7;
  font-size: 0.8em;
}

.sortable-header.sorted-asc .sort-arrow,
.sortable-header.sorted-desc .sort-arrow {
  opacity: 1;
}

.tasks-table tbody tr:last-child td {
  border-bottom: none; /* Remove bottom border from last row */
}

.tasks-table tbody tr:hover {
  background-color: rgba(var(--color-primary-green-rgb, 1, 255, 0), 0.05); /* Subtle hover */
  /* Define --color-primary-green-rgb in main.css or use a pre-calculated rgba */
  /* e.g., :root { --color-primary-green-rgb: 1, 255, 0; } */
}

.actions-cell {
  text-align: right; /* Align action buttons to the right */
  white-space: nowrap;
}

.actions-cell .icon-button {
  margin-left: 0.5rem; /* Space between action icons */
  /* IconButton should handle its own color, or you can override here */
  color: var(--color-primary-green); /* Make icons green */
}

.actions-cell .icon-button.delete-icon:hover {
  color: #ff4d4d; /* Example: red on hover for delete */
}

.create-task-button-footer {
  margin-top: var(--padding-standard, 1rem);
  display: block; /* Make it block to center or align */
  margin-left: auto;
  margin-right: auto; /* Center the button */
  max-width: 200px; /* Optional: constrain button width */
}

/* Responsive table - basic example: stack cells on small screens */
@media (max-width: 768px) {
  .tasks-table thead {
    display: none; /* Hide table headers */
  }

  .tasks-table,
  .tasks-table tbody,
  .tasks-table tr,
  .tasks-table td {
    display: block;
    width: 100%;
  }

  .tasks-table tr {
    margin-bottom: 1rem;
    border: 1px solid var(--color-border-primary);
    border-radius: var(--border-radius);
  }

  .tasks-table td {
    text-align: right; /* Align cell content to the right */
    padding-left: 50%; /* Create space for the label */
    position: relative;
    border-bottom: 1px dashed rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.3);
  }

  .tasks-table td:last-child {
    border-bottom: none;
  }

  .tasks-table td::before {
    content: attr(data-label); /* Use data-label for pseudo-element header */
    position: absolute;
    left: 0.5em;
    width: calc(50% - 1em); /* Adjust width of the label area */
    padding-right: 0.5em;
    text-align: left;
    font-weight: bold;
    color: var(--color-primary-green);
  }

  .actions-cell {
    text-align: right; /* Keep actions aligned right */
    padding-left: 0.5em; /* Reset padding for actions cell */
  }

  .actions-cell::before {
    content: ''; /* No label for actions cell or set it to "Actions" */
  }
}
</style>
