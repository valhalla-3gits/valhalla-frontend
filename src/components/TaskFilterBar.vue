<template>
  <div class="task-filter-bar">
    <div class="filter-group search-group">
      <SearchInput
        v-model="internalSearchTerm"
        :placeholder="searchPlaceholder"
        @search="emitSearch"
        aria-label="Search tasks"
      />
    </div>

    <div class="filter-group dropdown-group">
      <DropdownFilter
        v-if="rankOptions && rankOptions.length > 0"
        v-model="internalSelectedRank"
        :options="rankOptions"
        :placeholder="rankFilterPlaceholder"
        button-label="Rank"
        class="filter-dropdown"
      />
      <DropdownFilter
        v-if="languageOptions && languageOptions.length > 0"
        v-model="internalSelectedLanguage"
        :options="languageOptions"
        :placeholder="languageFilterPlaceholder"
        button-label="Language"
        class="filter-dropdown"
      />
      <DropdownFilter
        v-if="sortOptions && sortOptions.length > 0"
        v-model="internalSelectedSort"
        :options="sortOptions"
        :placeholder="sortFilterPlaceholder"
        :button-label="currentSortLabel"
        class="filter-dropdown sort-dropdown"
      >
        <!-- Optional: Custom icon for sort dropdown -->
        <!-- <template #buttonPrefix>
            <i class="fas fa-sort-amount-down" style="margin-right: 0.4em;"></i>
        </template> -->
      </DropdownFilter>
    </div>
    <!-- Optional: A button to apply all filters at once if not emitting on change -->
    <!-- <BaseButton v-if="applyButton" text="Apply Filters" @click="applyAllFilters" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed } from 'vue'
import SearchInput from './SearchInput.vue' // Adjust path
import DropdownFilter, { type DropdownOption } from './DropdownFilter.vue' // Adjust path
// import BaseButton from './BaseButton.vue'; // If using an apply button

export interface Filters {
  search_string: string
  rank_filter: string | number | null
  language_filter: string | number | null
  sortBy: string | number | null
}

export default defineComponent({
  name: 'TaskFilterBar',
  components: {
    SearchInput,
    DropdownFilter,
    // BaseButton,
  },
  props: {
    // --- Model values for filters (for v-model:filters like pattern or individual v-models) ---
    searchTerm: {
      type: String,
      default: '',
    },
    selectedRank: {
      type: [String, Number, Object] as PropType<string | number | null>, // Object if you pass complex selected value
      default: null,
    },
    selectedLanguage: {
      type: [String, Number, Object] as PropType<string | number | null>,
      default: null,
    },
    selectedSort: {
      type: [String, Number, Object] as PropType<string | number | null>,
      default: null,
    },

    // --- Options for dropdowns ---
    rankOptions: {
      type: Array as PropType<DropdownOption[]>,
      default: () => [],
    },
    languageOptions: {
      type: Array as PropType<DropdownOption[]>,
      default: () => [],
    },
    sortOptions: {
      type: Array as PropType<DropdownOption[]>,
      default: () => [],
    },

    // --- Placeholders ---
    searchPlaceholder: {
      type: String,
      default: 'Search tasks...',
    },
    rankFilterPlaceholder: {
      type: String,
      default: 'All Ranks',
    },
    languageFilterPlaceholder: {
      type: String,
      default: 'All Languages',
    },
    sortFilterPlaceholder: {
      type: String,
      default: 'Sort by...',
    },
    // --- Behavior ---
    // applyButton: { // If you want a manual apply button
    //   type: Boolean,
    //   default: false,
    // },
    emitOnChange: {
      // If true, emits 'filters-updated' on any filter change
      type: Boolean,
      default: true, // Common behavior
    },
  },
  emits: {
    'update:searchTerm': (value: string) => true,
    'update:selectedRank': (value: string | number | null) => true,
    'update:selectedLanguage': (value: string | number | null) => true,
    'update:selectedSort': (value: string | number | null) => true,
    /**
     * Emitted when any filter value changes and emitOnChange is true,
     * or when an explicit apply button is clicked.
     * Payload is an object with all current filter values.
     */
    'filters-updated': (filters: Filters) => true,
  },
  setup(props, { emit }) {
    // Internal refs to manage state if not using direct v-model on individual props
    // This allows for debouncing or emitting a single 'filters-updated' event
    const internalSearchTerm = ref(props.searchTerm)
    const internalSelectedRank = ref(props.selectedRank)
    const internalSelectedLanguage = ref(props.selectedLanguage)
    const internalSelectedSort = ref(props.selectedSort)

    const updateFilters = () => {
      const currentFilters: Filters = {
        search_string: internalSearchTerm.value,
        rank_filter: internalSelectedRank.value,
        language_filter: internalSelectedLanguage.value,
        sortBy: internalSelectedSort.value,
      }
      // Emit individual updates for v-model like behavior
      emit('update:searchTerm', internalSearchTerm.value)
      emit('update:selectedRank', internalSelectedRank.value)
      emit('update:selectedLanguage', internalSelectedLanguage.value)
      emit('update:selectedSort', internalSelectedSort.value)

      // Emit a single event with all filters
      if (props.emitOnChange) {
        emit('filters-updated', currentFilters)
      }
    }

    // Watch internal refs and call updateFilters
    watch(internalSearchTerm, () => {
      if (props.emitOnChange) updateFilters()
    }) // Search might be handled separately via @search
    watch(internalSelectedRank, updateFilters)
    watch(internalSelectedLanguage, updateFilters)
    watch(internalSelectedSort, updateFilters)

    // Sync internal refs if props change from parent (if parent uses individual v-models)
    watch(
      () => props.searchTerm,
      (newVal) => (internalSearchTerm.value = newVal),
    )
    watch(
      () => props.selectedRank,
      (newVal) => (internalSelectedRank.value = newVal),
    )
    watch(
      () => props.selectedLanguage,
      (newVal) => (internalSelectedLanguage.value = newVal),
    )
    watch(
      () => props.selectedSort,
      (newVal) => (internalSelectedSort.value = newVal),
    )

    const emitSearch = (term: string) => {
      // If SearchInput emits a 'search' event, we ensure internalSearchTerm is up-to-date
      // and then call updateFilters if emitOnChange is true.
      // Or, you might want a specific 'search-triggered' event from TaskFilterBar.
      internalSearchTerm.value = term // Ensure sync if SearchInput's modelValue wasn't directly used
      updateFilters()
    }

    // const applyAllFilters = () => { // If using an apply button
    //   updateFilters();
    // };

    const currentSortLabel = computed(() => {
      const selected = props.sortOptions.find((opt) => opt.value === internalSelectedSort.value)
      // Example: Prepend sort icon to label for sort dropdown
      // This could be more dynamic or handled via a slot in DropdownFilter
      return selected ? `↕ ${selected.label}` : props.sortFilterPlaceholder
    })

    return {
      internalSearchTerm,
      internalSelectedRank,
      internalSelectedLanguage,
      internalSelectedSort,
      emitSearch,
      // applyAllFilters,
      currentSortLabel,
    }
  },
})
</script>

<style scoped>
.task-filter-bar {
  display: flex;
  flex-wrap: wrap; /* Allow filters to wrap on smaller screens */
  gap: var(--padding-standard, 1rem); /* Space between filter groups/items */
  align-items: center; /* Align items vertically */
  padding: 0.5rem 0; /* Padding around the bar itself */
  margin-bottom: var(--padding-standard, 1rem); /* Space below the filter bar */
  font-family: var(--font-family-monospace);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem; /* Space between items within a group */
  align-items: center;
}

.search-group {
  flex-grow: 1; /* Allow search to take more space if needed */
  min-width: 200px; /* Minimum width for search */
}

.dropdown-group {
  /* Styles for the group of dropdowns if needed */
}

.filter-dropdown {
  min-width: 150px; /* Ensure dropdowns have a decent width */
}

/* Example: Specific styling for the sort dropdown to match screenshot's appearance */
.sort-dropdown .dropdown-button {
  /* If you want to mimic the icon inside the button text as per screenshot */
  /* This might require a slot in DropdownFilter for prefix icon or more complex label prop */
}

/* If using an apply button */
/* .task-filter-bar > .base-button {
  margin-left: auto;
} */

/* Responsive adjustments */
@media (max-width: 768px) {
  .task-filter-bar {
    flex-direction: column;
    align-items: stretch; /* Make items take full width in column layout */
  }

  .search-group,
  .filter-group {
    width: 100%;
  }

  .filter-dropdown {
    width: 100%; /* Make dropdowns full width on small screens */
    margin-bottom: 0.5rem; /* Add some space when stacked */
  }

  .filter-dropdown:last-child {
    margin-bottom: 0;
  }
}
</style>
