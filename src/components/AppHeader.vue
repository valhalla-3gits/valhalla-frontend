<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo Area -->
      <router-link to="/" class="header__logo-link">
        <!-- IMPORTANT: Replace the content below with your actual ASCII art -->
        <pre class="header__logo-ascii">
 _   __     ____        ____
| | / /__ _/ / /  ___ _/ / /__ _
| |/ / _ `/ / _ \/ _ `/ / / _ `/
|___/\_,_/_/_//_/\_,_/_/_/\_,_/
        </pre>
        <!-- End of ASCII art placeholder -->
      </router-link>

      <!-- Navigation Area -->
      <nav class="header__nav">
        <!-- Landing Variant -->
        <div v-if="variant === 'landing'" class="nav-links">
          <router-link to="/about" class="nav-link">
            <!-- Add icon span if needed -->
            About
          </router-link>
          <a
            href="https://github.com/valhalla-3gits"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-link"
          >
            <!-- Add icon span if needed -->
            Github
          </a>
          <router-link v-slot="{ navigate, href }" to="/login" custom>
            <BaseButton text="Log in" styleType="outlined" :href="href" @click="navigate" />
          </router-link>
          <router-link v-slot="{ navigate, href }" to="/signup" custom>
            <BaseButton text="Join" styleType="outlined" :href="href" @click="navigate" />
          </router-link>
        </div>

        <!-- User Variant -->
        <div v-else-if="variant === 'user'" class="nav-links">
          <a
            href="https://github.com/valhalla-3gits"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-link"
          >
            <!-- Add icon span if needed -->
            Github
          </a>
          <router-link v-slot="{ navigate, href }" to="/dashboard" custom>
            <BaseButton text="Dashboard" styleType="outlined" :href="href" @click="navigate" />
          </router-link>
          <!-- Optional Logout Button -->
          <!-- <BaseButton text="Logout" styleType="outlined" @click="handleLogout" /> -->
        </div>

        <!-- Admin Variant -->
        <div v-else-if="variant === 'admin'" class="nav-links">
          <router-link to="/admin/dashboard" class="nav-link">
            <!-- Add icon span if needed -->
            Home
          </router-link>
          <router-link to="/profile" class="nav-link">
            <!-- Add icon span if needed -->
            Profile
          </router-link>
          <router-link to="/admin" class="nav-link">
            <!-- Add icon span if needed -->
            Admin Panel
          </router-link>
          <!-- Optional Logout Button -->
          <!-- <BaseButton text="Logout" styleType="outlined" @click="handleLogout" /> -->
        </div>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type {PropType} from 'vue'
import BaseButton from './BaseButton.vue' // Adjust the path as necessary

// Define possible header variants for type safety
type HeaderVariant = 'landing' | 'user' | 'admin'

export default defineComponent({
  name: 'AppHeader',

  components: {
    BaseButton,
  },

  props: {
    /**
     * Determines the set of navigation links/buttons displayed.
     */
    variant: {
      type: String as PropType<HeaderVariant>,
      required: true,
      validator: (value: string) => ['landing', 'user', 'admin'].includes(value),
    },
  },

  // If you need methods for logout or other actions, add them here
  methods: {
    // Example logout handler (implement actual logic)
    // handleLogout() {
    //   console.log('Logout action triggered');
    //   // Add logout logic here, e.g., clearing tokens, redirecting
    //   this.$router.push('/login');
    // }
  },
})
</script>

<style scoped>
/* Define color variables */
.app-header {
  background-color: var(--color-background-dark);
  padding: 0.5rem 1.5rem; /* Adjust padding as needed */
  border: 5px solid var(--color-primary-green); /* Thin green line */
  color: var(--color-text-primary);
  font-family: var(--font-family-monospace);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto; /* Optional: center container */
}

.header__logo-link {
  text-decoration: none; /* Remove underline from link */
  color: inherit; /* Inherit green color */
}

.header__logo-ascii {
  color: var(--color-primary-green);
  font-family: var(--font-family-monospace), monospace;
  white-space: pre; /* Crucial: Preserves whitespace and line breaks */
  margin: 0; /* Reset default margin */
  padding: 0;
  line-height: 1; /* Adjust for tighter lines if needed */
  font-size: 0.8rem; /* Adjust size as needed */
  user-select: none; /* Prevent text selection */
  display: inline-block; /* Ensure it behaves like a block but flows */
}

.header__nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Spacing between nav items */
}

.nav-link {
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 0.9rem; /* Adjust as needed */
  transition: opacity 0.2s ease-in-out;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link:focus {
  opacity: 0.8;
  text-decoration: underline; /* Optional: underline on hover */
}

/* Style for active router links */
.nav-link.router-link-exact-active {
  /* Add distinct styling for the active page link */
  /* Example: */
  font-weight: bold;
  /* text-decoration: underline; */
  /* Or change color slightly if needed */
}

/* Ensure BaseButton aligns well if needed */
.nav-links > .base-button {
  /* Add specific margin adjustments if gap isn't perfect */
}

/* If using icons within .nav-link */
.nav-link .icon-class {
  /* Replace .icon-class with your actual icon class */
  margin-right: 0.4em;
  vertical-align: middle; /* Adjust alignment */
}
</style>
