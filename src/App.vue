// In App.vue or a layout component
<template>
  <div>
    <!-- Determine variant based on route, auth status, etc. -->
    <AppHeader :variant="headerVariant" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <!-- Add Footer component here -->
    <AppFooter />
    <MessageBox />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router' // Or use this.$route in Options API
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.ts'
import { UserRoleEnum } from '@/types/enums/roles/userRole.enum.ts'
import MessageBox from './components/MessageBox.vue'
// Import logic for checking auth status / admin status

type HeaderVariant = 'landing' | 'user' | 'admin'

export default defineComponent({
  components: { AppFooter, AppHeader, MessageBox },
  setup() {
    const authStore = useAuthStore()
    const route = useRoute()
    // Example logic to determine variant (replace with your actual logic)
    const headerVariant = computed((): HeaderVariant => {
      if (!authStore.isUserAuthenticated || !authStore.currentUser) {
        return 'landing'
      }
      // Assuming user.role exists and is 'admin' or 'user'
      if (authStore.currentUser.role === UserRoleEnum.ADMIN) {
        return 'admin'
      }
      return 'user' // Default for authenticated users
    })

    return { headerVariant }
  },
  // Or implement similar logic using Options API's computed properties and this.$route
})
</script>

<style scoped>
/* Optional: Basic layout styling */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ensure footer sticks to bottom if content is short */
}

.app-content {
  flex-grow: 1; /* Allow main content to take up available space */
  padding: var(--padding-standard); /* Use global padding */
}
</style>
