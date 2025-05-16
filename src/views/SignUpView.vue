<template>
  <div class="signup-view">
    <MatrixBackground />

    <div class="signup-form-container">
      <ContentBox title="Create Account">
        <form @submit.prevent="handleSignUp" class="signup-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model.trim="formData.username"
              placeholder="Choose a username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div class="form-group">
            <label for="firstName">First Name <span class="optional-text">[optional]</span></label>
            <input
              type="text"
              id="firstName"
              v-model.trim="formData.firstName"
              placeholder="Your first name"
            />
          </div>

          <div class="form-group">
            <label for="secondName"
              >Second Name <span class="optional-text">[optional]</span></label
            >
            <input
              type="text"
              id="secondName"
              v-model.trim="formData.secondName"
              placeholder="Your second name"
            />
          </div>

          <BaseButton
            type="submit"
            text="Sign Up"
            styleType="filled"
            class="submit-button"
            :disabled="isLoading"
          />

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="login-link-container">
            Already have an account?
            <router-link to="/login" class="login-link">Sign In</router-link>
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

export default defineComponent({
  name: 'SignUpView',
  components: {
    BaseButton,
    ContentBox,
    MatrixBackground,
  },
  data() {
    return {
      formData: {
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        secondName: '',
      },
      isLoading: false,
      errorMessage: '',
    }
  },
  methods: {
    async handleSignUp() {
      this.errorMessage = '' // Clear previous errors
      if (!this.validateForm()) {
        return
      }

      this.isLoading = true
      console.log('Signing up with data:', this.formData)
      const authStore = useAuthStore();

      // Simulate API call
      try {
        await authStore.register({
          username: this.formData.username,
          password: this.formData.password,
          firstname: this.formData.firstName,
          secondname: this.formData.secondName,
        });

        // On successful signup
        // alert('Sign up successful! Please log in.') // Replace with better UX
        this.$router.push('/login') // Redirect to login page
      } catch (error: any) {
        console.error('Sign up failed:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        }
        else {
          this.errorMessage = 'Sign up failed. Please try again.';
        }
      } finally {
        this.isLoading = false;
      }
    },

    validateForm(): boolean {
      if (
        !this.formData.username ||
        !this.formData.password ||
        !this.formData.confirmPassword
      ) {
        this.errorMessage = 'Please fill in all required fields.'
        return false
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match.'
        return false
      }
      return true
    },
  },
})
</script>

<style scoped>
.signup-view {
  position: relative;
  width: 100%;
  min-height: 100vh; /* Ensure it takes at least the viewport height */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--padding-standard, 1rem);
  box-sizing: border-box;
  font-family: var(--font-family-monospace);
  color: var(--color-text-primary);
}

.signup-form-container {
  position: relative; /* To sit above MatrixBackground */
  z-index: 1;
  width: 100%;
  max-width: 450px; /* Adjust as needed */
}

/* Target ContentBox specifically within this view if needed */
.signup-form-container .content-box {
  /* Add specific styles if ContentBox needs adjustments here */
  padding: calc(var(--padding-standard, 1rem) * 1.5); /* More padding inside the box */
}

.signup-form .form-group {
  margin-bottom: 1.2rem;
}

.signup-form label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.signup-form input[type='text'],
.signup-form input[type='email'],
.signup-form input[type='password'] {
  width: 100%;
  padding: 0.7em 0.8em;
  background-color: var(--color-background-dark); /* Or a slightly lighter shade */
  border: 2px solid var(--color-border-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-monospace);
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out;
}

.signup-form input[type='text']:focus,
.signup-form input[type='email']:focus,
.signup-form input[type='password']:focus {
  outline: none;
  border-color: var(--color-primary-green); /* Highlight focus */
  /* box-shadow: 0 0 5px var(--color-primary-green); */ /* Optional glow */
}

.optional-text {
  font-size: 0.8em;
  opacity: 0.7;
}

.submit-button {
  width: 100%;
  margin-top: 0.5rem; /* Space above button */
  padding: 0.8em 1em;
  font-size: 1rem;
}

.error-message {
  color: var(--color-error-primary); /* A contrasting error color */
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login-link-container {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.login-link {
  color: var(--color-primary-green);
  text-decoration: underline;
  font-weight: bold;
}

.login-link:hover {
  opacity: 0.8;
}
</style>
