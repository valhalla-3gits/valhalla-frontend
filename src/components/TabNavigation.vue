<template>
  <nav class="tab-navigation" role="tablist" :aria-label="ariaLabel || 'Tab Navigation'">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :id="`tab-${tab.id}`"
      :class="['tab-button', { 'tab-button--active': tab.id === activeTabId }]"
      type="button"
      role="tab"
      :aria-selected="tab.id === activeTabId"
      :aria-controls="`tabpanel-${tab.id}`"
      @click="selectTab(tab.id)"
      @keydown.enter.prevent="selectTab(tab.id)"
      @keydown.space.prevent="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

// Define the structure for a tab object
export interface Tab {
  id: string | number // Unique identifier for the tab
  label: string // Text displayed on the tab
  disabled?: boolean // Optional: if the tab should be disabled
}

export default defineComponent({
  name: 'TabNavigation',

  props: {
    /**
     * An array of tab objects to display.
     * Each object should have at least 'id' and 'label'.
     */
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true,
      validator: (value: Tab[]) => {
        // Ensure each tab has an id and a label
        return value.every(
          (tab) => tab && typeof tab.id !== 'undefined' && typeof tab.label === 'string',
        )
      },
    },
    /**
     * The ID of the currently active tab.
     */
    activeTabId: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    /**
     * Optional ARIA label for the tab navigation container.
     */
    ariaLabel: {
      type: String,
      default: null,
    },
  },

  emits: {
    /**
     * Emitted when a tab is selected.
     * Payload is the ID of the selected tab.
     */
    'tab-change': (tabId: string | number) => {
      // Optional runtime validation for the emitted event
      return typeof tabId === 'string' || typeof tabId === 'number'
    },
  },

  methods: {
    selectTab(tabId: string | number) {
      // Find the tab to check if it's disabled
      const selectedTab = this.tabs.find((tab) => tab.id === tabId)
      if (selectedTab && selectedTab.disabled) {
        return // Do nothing if the tab is disabled
      }
      if (this.activeTabId !== tabId) {
        this.$emit('tab-change', tabId)
      }
    },
  },
})
</script>

<style scoped>
.tab-navigation {
  display: flex;
  gap: 0.5rem; /* Space between tab buttons */
  border-bottom: 1px solid var(--color-border-primary); /* Optional: a line below the tabs */
  padding-bottom: 0px; /* Adjust if border-bottom is used to align visually */
  margin-bottom: var(--padding-standard, 1rem); /* Space below the tab navigation */
  font-family: var(--font-family-monospace);
}

.tab-button {
  padding: 0.6em 1.2em;
  cursor: pointer;
  border: 1px solid transparent; /* Base border */
  border-bottom: none; /* Remove bottom border to merge with container's border-bottom or for cleaner look */
  background-color: transparent; /* Default background */
  color: var(--color-text-primary); /* Default text color, can be less prominent */
  font-family: inherit; /* Inherit from .tab-navigation */
  font-size: 0.95rem; /* Adjust as needed */
  font-weight: normal;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
  border-top-left-radius: var(--border-radius, 4px); /* Optional rounded corners */
  border-top-right-radius: var(--border-radius, 4px);
  opacity: 0.8; /* Make non-active tabs slightly less prominent */
}

.tab-button:hover,
.tab-button:focus {
  outline: none;
  color: var(--color-primary-green);
  opacity: 1;
  /* background-color: rgba(var(--color-primary-green-rgb, 1, 255, 0), 0.1); */ /* Subtle hover background */
}

.tab-button--active {
  background-color: var(--color-primary-green);
  color: var(--color-text-on-primary); /* Text color for on-green background */
  border-color: var(--color-border-primary); /* Match active tab border with container border */
  font-weight: bold;
  opacity: 1;
  /* To make the active tab "connect" if there's a border-bottom on .tab-navigation: */
  /* margin-bottom: -1px; */ /* Pulls the active tab down by 1px to cover the container's border */
}

.tab-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text-primary); /* Keep text color consistent but faded */
}

.tab-button[disabled]:hover,
.tab-button[disabled]:focus {
  background-color: transparent; /* No hover effect for disabled */
  color: var(--color-text-primary); /* Keep text color consistent but faded */
}
</style>
