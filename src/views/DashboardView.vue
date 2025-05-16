<template>
  <div class="dashboard-view">
    <div class="dashboard-layout">
      <!-- Left Column: Task Listing and Filtering -->
      <aside class="column column-left">
        <TabNavigation
          :tabs="taskViewTabs"
          :active-tab-id="activeTaskViewTab"
          @tab-change="onTaskViewTabChange"
          aria-label="Task categories"
        />
        <TaskFilterBar
          :search-term="filters.search_string"
          :selected-rank="filters.rank_filter"
          :selected-language="filters.language_filter"
          :selected-sort="filters.sortBy"
          :rank-options="rankFilterOptions"
          :language-options="languageFilterOptions"
          :sort-options="sortOptions"
          @filters-updated="handleFiltersUpdate"
          @update:searchTerm="val => filters.search_string = val"
          @update:selectedRank="val => filters.rank_filter = val"
          @update:selectedLanguage="val => filters.language_filter = val"
          @update:selectedSort="val => filters.sortBy = val"
        />
        <TaskList
          :tasks="displayedTasks"
          :is-loading="isLoadingTasks"
          :is-task-clickable="true"
          :has-more="pagination.hasMore"
          :is-fetching-more="isFetchingMoreTasks"
          @task-select="navigateToTaskDetails"
          @load-more="loadMoreTasks"
        />
      </aside>

      <!-- Right Column: User Profile and User's Tasks -->
      <section class="column column-right">
        <UserProfileSection
          v-if="currentUser"
          :user="currentUser"
          :user-stats="userStats"
          @logout="handleLogout"
          @edit-profile="openEditProfileModal"
        />
        <div v-else class="loading-placeholder">Loading profile...</div>

        <UserTasksSection
          :user-tasks="userCreatedTasks"
          :is-loading="isLoadingUserCreatedTasks"
          @create-task="navigateToCreateTask"
          @edit-task="navigateToEditTask"
          @delete-task="handleDeleteUserTask"
        />
      </section>
    </div>
    <!-- Modals for Edit Profile, Create/Edit Task can be placed here -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, type UserFull } from '@/stores/auth'
import apiClient from '@/services/api'; // Your configured Axios instance

// Import Components
import TabNavigation, { type Tab } from '@/components/TabNavigation.vue';
import TaskFilterBar, { type Filters } from '@/components/TaskFilterBar.vue';
import TaskList from '@/components/TaskList.vue';
import UserProfileSection from '@/components/UserProfileSection.vue'; // Assuming you'll create this
import UserTasksSection from '@/components/UserTasksSection.vue'; // Assuming you'll create this
import { type DropdownOption } from '@/components/DropdownFilter.vue';
import type { TaskDto } from '@/types/defs/tasks/task.dto.ts'

// Define interfaces for API responses if not already defined elsewhere
interface UserProfile {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  secondName?: string;
  role: 'user' | 'admin';
  // Add other profile fields from your API (e.g., rankName, currentRank, nextRank)
  rankName?: string; // e.g., "Þræll"
  currentRankValue?: number; // e.g., 1
  nextRankValue?: number; // e.g., 2
}

interface UserStats {
  tasksCompleted: number;
  currentXp: number;
  xpToNextRank: number;
  nextRank: string;
  // Add other stats
}

interface PaginatedTasks {
  items: TaskDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}


export default defineComponent({
  name: 'DashboardView',
  components: {
    TabNavigation,
    TaskFilterBar,
    TaskList,
    UserProfileSection,
    UserTasksSection,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    // --- Reactive Data ---
    const currentUser = computed(() => authStore.userFull as UserFull | null); // Cast for extra fields
    const userStats = ref<UserStats | null>(null);

    const activeTaskViewTab = ref<string>('all'); // 'suggested', 'favourites', 'solved'
    const taskViewTabs = ref<Tab[]>([
      { id: 'all', label: 'All tasks' },
      { id: 'favourites', label: 'Favourite tasks' },
      { id: 'solved', label: 'Solved tasks' },
    ]);

    const filters = reactive<Filters>({
      search_string: '',
      rank_filter: null,
      language_filter: null,
      sortBy: 'newest', // Default sort
    });

    const rankFilterOptions = ref<DropdownOption[]>([]);
    const languageFilterOptions = ref<DropdownOption[]>([]);
    const sortOptions = ref<DropdownOption[]>([
      { value: 'newest', label: 'Newest' },
      { value: 'oldest', label: 'Oldest' },
      { value: 'name_asc', label: 'Name Asc' },
      { value: 'name_desc', label: 'Name Desc' },
    ]);

    const displayedTasks = ref<TaskDto[]>([]);
    const isLoadingTasks = ref(false);
    const isFetchingMoreTasks = ref(false);
    const pagination = reactive({
      currentPage: 1,
      limit: 10, // Number of tasks per page
      hasMore: false,
    });

    const userCreatedTasks = ref<TaskDto[]>([]);
    const isLoadingUserCreatedTasks = ref(false);

    // --- Methods ---

    const fetchFilterOptions = async () => {
      try {
        // Parallel requests for ranks and languages
        const [ranksRes, languagesRes] = await Promise.all([
          apiClient.get('/meta/ranks'),      // Example endpoint: GET /api/meta/ranks
          apiClient.get('/meta/languages'),  // Example endpoint: GET /api/meta/languages
        ]);

        rankFilterOptions.value = ranksRes.data.map((rank: { id: string | number, name: string }) => ({
          value: rank.id,
          label: rank.name,
        }));
        // Add an "All Ranks" option
        rankFilterOptions.value.unshift({ value: '', label: 'All Ranks' });


        languageFilterOptions.value = languagesRes.data.map((lang: { id: string | number, name: string }) => ({
          value: lang.id,
          label: lang.name,
        }));
        // Add an "All Languages" option
        languageFilterOptions.value.unshift({ value: '', label: 'All Languages' });

      } catch (error) {
        console.error('Failed to fetch filter options:', error);
        // Handle error (e.g., show a notification)
      }
    };

    const fetchTasks = async (loadMore = false) => {
      if (!loadMore) {
        isLoadingTasks.value = true;
        displayedTasks.value = []; // Clear previous tasks for a new filter/tab
        pagination.currentPage = 1;
      } else {
        isFetchingMoreTasks.value = true;
      }

      try {
        const params: any = {
          page: pagination.currentPage,
          limit: pagination.limit,
          search_type: activeTaskViewTab.value,
          search_string: filters.search_string || undefined, // Send only if not empty
          rank_filter: filters.rank_filter || undefined,
          language_filter: filters.language_filter || undefined,
          sort_by: filters.sortBy || undefined,
        };
        // Remove undefined params
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const response = await apiClient.get<PaginatedTasks>('/tasks', { params }); // Example: GET /api/tasks
        if (loadMore) {
          displayedTasks.value.push(...response.data.items);
        } else {
          displayedTasks.value = response.data.items;
        }
        pagination.hasMore = response.data.hasMore;

      } catch (error) {
        console.error(`Failed to fetch ${activeTaskViewTab.value} tasks:`, error);
        // Handle error
      } finally {
        isLoadingTasks.value = false;
        isFetchingMoreTasks.value = false;
      }
    };

    const fetchUserStats = async () => {
      if (!currentUser.value) return;
      try {
        const response = await apiClient.get(`/users/stats`); // Example: GET /api/users/:id/stats
        userStats.value = response.data;
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    const fetchUserCreatedTasks = async () => {
      isLoadingUserCreatedTasks.value = true;
      try {
        const response = await apiClient.get('/tasks/my-tasks'); // Example: GET /api/tasks/my-tasks
        userCreatedTasks.value = response.data;
      } catch (error) {
        console.error('Failed to fetch user created tasks:', error);
      } finally {
        isLoadingUserCreatedTasks.value = false;
      }
    };

    const onTaskViewTabChange = (tabId: string | number) => {
      activeTaskViewTab.value = tabId as string;
      fetchTasks(); // Refetch tasks for the new tab
    };

    const handleFiltersUpdate = (newFilters: Filters) => {
      // Filters are already updated via individual v-models,
      // this is just a confirmation or can be used if emitOnChange is false on FilterBar
      console.log('Filters updated:', newFilters);
      fetchTasks(); // Refetch tasks with new filters
    };

    watch([() => filters.search_string, () => filters.rank_filter, () => filters.language_filter, () => filters.sortBy], () => {
      // This watch will trigger fetchTasks if individual filter props are updated
      // and TaskFilterBar's emitOnChange is true (which it is by default)
      // or if you manually update filters object.
      fetchTasks();
    }, { deep: true });


    const loadMoreTasks = () => {
      if (pagination.hasMore && !isFetchingMoreTasks.value) {
        pagination.currentPage++;
        fetchTasks(true);
      }
    };

    const navigateToTaskDetails = (taskId: string | number) => {
      router.push(`/task/${taskId}`);
    };

    const handleLogout = () => {
      authStore.logout();
    };

    const openEditProfileModal = () => {
      console.log('Open edit profile modal for user:', currentUser.value?.username);
      // Implement modal logic or navigation
    };

    const navigateToCreateTask = () => {
      router.push('/tasks/create');
    };

    const navigateToEditTask = (token: string | number) => {
      router.push(`/tasks/edit/${token}`);
    };

    const handleDeleteUserTask = async (taskToken: string | number) => {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await apiClient.delete(`/tasks/${taskToken}`); // Example: DELETE /api/tasks/:id
          // Refetch user tasks or remove from local list
          userCreatedTasks.value = userCreatedTasks.value.filter(task => task.token !== taskId);
          alert('Task deleted successfully.');
        } catch (error) {
          console.error('Failed to delete task:', error);
          alert('Failed to delete task.');
        }
      }
    };


    // --- Lifecycle Hooks ---
    onMounted(async () => {
      if (!authStore.currentUser) { // Ensure user data is loaded if coming directly to dashboard
        await authStore.fetchUserProfile();
      }
      await fetchFilterOptions();
      await fetchTasks();
      await fetchUserStats();
      // await fetchUserCreatedTasks();
    });

    return {
      currentUser,
      userStats,
      activeTaskViewTab,
      taskViewTabs,
      filters,
      rankFilterOptions,
      languageFilterOptions,
      sortOptions,
      displayedTasks,
      isLoadingTasks,
      isFetchingMoreTasks,
      pagination,
      userCreatedTasks,
      isLoadingUserCreatedTasks,
      onTaskViewTabChange,
      handleFiltersUpdate,
      loadMoreTasks,
      navigateToTaskDetails,
      handleLogout,
      openEditProfileModal,
      navigateToCreateTask,
      navigateToEditTask,
      handleDeleteUserTask,
    };
  },
});
</script>

<style scoped>
.dashboard-view {
  padding: var(--padding-standard, 1rem);
  background-color: var(--color-background-dark); /* Ensure view bg matches */
  /*min-height: calc(100vh - var(--header-height, 60px) - var(--footer-height, 50px)); /* Adjust header/footer height */
  /* You might need to define --header-height and --footer-height in main.css or App.vue */
}

.dashboard-layout {
  display: flex;
  gap: var(--padding-standard, 1rem); /* Space between columns */
  max-width: 1400px; /* Max width for the dashboard content */
  margin: 0 auto; /* Center the layout */
}

.column {
  display: flex;
  flex-direction: column;
  gap: var(--padding-standard, 1rem); /* Space between components within a column */
}

.column-left {
  flex: 2; /* Takes up 2/3 of the space */
  min-width: 300px; /* Minimum width */
}

.column-right {
  flex: 1; /* Takes up 1/3 of the space */
  min-width: 300px; /* Minimum width */
}

.loading-placeholder {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-primary);
  opacity: 0.7;
  border: 1px dashed var(--color-border-primary);
  border-radius: var(--border-radius);
}


/* Responsive adjustments */
@media (max-width: 1024px) { /* Adjust breakpoint as needed */
  .dashboard-layout {
    flex-direction: column;
  }
  .column-left,
  .column-right {
    flex: none; /* Reset flex grow/shrink */
    width: 100%;
  }
}
</style>
