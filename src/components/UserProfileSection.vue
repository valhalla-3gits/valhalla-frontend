<template>
  <div>
    <ContentBox title="Profile" class="user-profile-section-box">
      <div v-if="!user" class="loading-placeholder">Loading profile...</div>
      <div v-else class="profile-content">
        <h2 class="username">{{ user.username }}</h2>

        <div class="rank-info">
          <span class="rank-label current-rank">{{ `Rank #${user.rank?.number}` }}</span>
          <span v-if="userStats" class="xp-text">
            {{ userStats.currentXp?.toLocaleString() || 0 }} /
            {{ userStats.xpToNextRank?.toLocaleString() || 'N/A' }}
          </span>
          <span v-if="user.rank?.targetValue" class="rank-label next-rank">
            {{ `Rank #${user.rank?.number + 1}` }}
          </span>
        </div>

        <ProgressBar
          v-if="
            userStats &&
            typeof userStats.currentXp === 'number' &&
            typeof userStats.xpToNextRank === 'number' &&
            userStats.xpToNextRank > 0
          "
          :currentValue="userStats.currentXp"
          :maxValue="userStats.xpToNextRank"
          height="12px"
          :aria-label="`${user.username}'s rank progress`"
          class="profile-progress-bar"
        />
        <div v-else-if="userStats" class="xp-text-only">
          XP: {{ userStats.currentXp?.toLocaleString() || 0 }}
        </div>

        <p v-if="userStats" class="tasks-completed">
          Tasks completed: {{ userStats.tasksCompleted?.toLocaleString() || 0 }}
        </p>

        <div class="profile-actions">
          <IconButton
            iconClass="nf nf-md-pencil"
            tooltip="Edit Profile"
            ariaLabel="Edit your profile"
            @click="emitEditProfile"
            variant="default"
          />
          <!-- Example: Deleting account is a sensitive action -->
          <IconButton
            iconClass="nf nf-fa-trash"
            tooltip="Delete Account"
            ariaLabel="Delete your account"
            @click="handleDeleteAccount"
            variant="danger"
          />
          <BaseButton
            text="Log Out"
            styleType="outlined"
            @click="emitLogout"
            class="logout-button"
          />
        </div>
      </div>
    </ContentBox>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ContentBox from './ContentBox.vue'    // Adjust path
import ProgressBar from './ProgressBar.vue'  // Adjust path
import IconButton from './IconButton.vue'    // Adjust path
import BaseButton from './BaseButton.vue'
import type { UserFull } from '@/stores/auth.ts'    // Adjust path

// Define interfaces to match the expected structure of props
// These should align with what DashboardView provides
export interface UserProfileData {
  id: string | number;
  username: string;
  email?: string; // Optional as it might not be displayed
  firstName?: string;
  secondName?: string;
  role?: 'user' | 'admin';
  rankName?: string;         // e.g., "Þræll"
  currentRankValue?: number; // e.g., 1 (numeric representation of current rank)
  nextRankValue?: number;    // e.g., 2 (numeric representation of next rank)
  // Add any other fields displayed in the profile
}

export interface UserStatsData {
  tasksCompleted: number;
  currentXp: number;
  xpToNextRank: number; // This should be the total XP needed for the next rank, not remaining XP
  // Add other stats
}

export default defineComponent({
  name: 'UserProfileSection',
  components: {
    ContentBox,
    ProgressBar,
    IconButton,
    BaseButton
  },
  props: {
    user: {
      type: Object as PropType<UserFull | null>,
      required: true
    },
    userStats: {
      type: Object as PropType<UserStatsData | null>,
      default: null
    }
  },
  emits: {
    'logout': () => true,
    'edit-profile': () => true,
    'delete-account': () => true // If you implement this
  },
  methods: {
    emitLogout() {
      this.$emit('logout')
    },
    emitEditProfile() {
      this.$emit('edit-profile')
    },
    handleDeleteAccount() {
      this.$emit('delete-account')
    }
  }
})
</script>

<style scoped>
.user-profile-section-box {
  /* ContentBox handles its own padding and border */
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
}

.loading-placeholder {
  padding: 2rem;
  text-align: center;
  opacity: 0.7;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem; /* Space between elements */
}

.username {
  font-size: 1.5rem; /* Or larger as in screenshot */
  font-weight: bold;
  color: var(--color-text-primary); /* Or white for more contrast if needed */
  margin: 0 0 0.2rem 0;
  text-align: left; /* As per screenshot */
}

.rank-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline; /* Align text baselines */
  font-size: 0.9rem;
  margin-bottom: 0.5rem; /* Space before progress bar */
  flex-wrap: wrap; /* Allow wrapping if space is tight */
  gap: 0.5em;
}

.rank-label {
  font-weight: normal;
  opacity: 0.9;
}

.current-rank {
  /* Specific styling if needed */
}

.next-rank {
  opacity: 0.7;
}

.xp-text {
  font-size: 0.85rem;
  opacity: 0.8;
  text-align: center;
  flex-grow: 1; /* Allow it to take space if current/next ranks are short */
}

.xp-text-only {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.profile-progress-bar {
  width: 100%;
  margin-bottom: 0.5rem; /* Space after progress bar */
}

.tasks-completed {
  font-size: 0.9rem;
  margin: 0.2rem 0;
  opacity: 0.9;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem; /* Space above action buttons */
  border-top: 1px solid rgba(var(--color-border-primary-rgb, 1, 255, 0), 0.2); /* Faint separator */
  padding-top: 1rem;
}

.profile-actions .icon-button {
  /* IconButton handles its own styling, but you can add margin or override here */
  /* Example: Make icons slightly smaller if needed */
  /* font-size: 0.9em; */
}

.logout-button {
  margin-left: auto; /* Push logout button to the right */
  /* BaseButton handles its own styling */
  padding: 0.5em 1em; /* Adjust padding if needed */
  font-size: 0.9rem;
}
</style>
