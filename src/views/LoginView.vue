<template>
  <div class="login-view">
    <MatrixBackground />

    <div class="login-form-container">
      <ContentBox title="Log In">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model.trim="credentials.username"
              placeholder="Enter your username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="credentials.password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
          </div>

          <BaseButton
            type="submit"
            text="Start"
            styleType="filled"
            class="submit-button"
            :disabled="isLoading"
          />

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="extra-links-container">
            <router-link to="/signup" class="extra-link">Create Account</router-link>
          </div>
        </form>
      </ContentBox>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseButton from '@/components/BaseButton.vue' // Adjust path if needed
import ContentBox from '@/components/ContentBox.vue' // Adjust path if needed
import MatrixBackground from '@/components/MatrixBackground.vue'
import { useAuthStore } from '@/stores/auth.ts' // Adjust path if needed

// Assuming you might have a store for auth state (e.g., Pinia or Vuex)
// import { useAuthStore } from '@/stores/auth'; // Example

export default defineComponent({
  name: 'LoginView',
  components: {
    BaseButton,
    ContentBox,
    MatrixBackground,
  },
  data() {
    return {
      credentials: {
        username: '',
        password: '',
      },
      isLoading: false,
      errorMessage: '',
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = '' // Clear previous errors
      if (!this.credentials.username || !this.credentials.password) {
        this.errorMessage = 'Please enter both username and password.'
        return
      }

      this.isLoading = true
      console.log('Logging in with credentials:', this.credentials)
      const authStore = useAuthStore();

      // Example: Get auth store if using Pinia/Vuex
      // const authStore = useAuthStore();

      try {
        await authStore.login(this.credentials);
        // Navigation is handled within the store's login action on success
      } catch (error: any) {
        console.error('Login failed:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        }
        else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
})
</script>

<style scoped>
.login-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--padding-standard, 1rem);
  box-sizing: border-box;
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
}

.login-form-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px; /* Slightly smaller for login form */
}

.login-form-container .content-box {
  padding: calc(var(--padding-standard, 1rem) * 1.5) calc(var(--padding-standard, 1rem) * 2);
}

.login-form .form-group {
  margin-bottom: 1.5rem; /* More space between username and password */
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.login-form input[type='text'],
.login-form input[type='password'] {
  width: 100%;
  padding: 0.75em 0.9em;
  background-color: var(--color-background-dark);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-monospace);
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out;
}

.login-form input[type='text']:focus,
.login-form input[type='password']:focus {
  outline: none;
  border-color: var(--color-primary-green);
  /* box-shadow: 0 0 3px var(--color-primary-green); */
}

.submit-button {
  width: 100%;
  margin-top: 0.8rem;
  padding: 0.8em 1em;
  font-size: 1.05rem;
}

.error-message {
  color: var(--color-error-primary);
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.extra-links-container {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-around; /* Or space-between */
  align-items: center;
}

.extra-link {
  color: var(--color-primary-green);
  text-decoration: none; /* Remove default underline if global 'a' has it */
}

.extra-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.extra-links-container span {
  opacity: 0.6; /* Make the separator less prominent */
}
</style>
