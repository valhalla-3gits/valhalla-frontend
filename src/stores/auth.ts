// src/stores/auth.ts
import { defineStore } from 'pinia'
import apiClient from '@/services/api' // Your configured Axios instance
import router from '@/router'
import type { UserRegisterDto } from '@/types/defs/users/userRegister.dto.ts'
import type { UserLoginDto } from '@/types/defs/users/userLogin.dto.ts'
import type { RankDto } from '@/types/defs/ranks/rank.dto.ts'
import type { UserRoleEnum } from '@/types/enums/roles/userRole.enum.ts' // Import router for navigation

// Define interfaces for your user and token data
interface User {
  token: string
  username: string
  status: string
  role: UserRoleEnum

  // Add other user properties as needed
}

export interface UserFull {
  token: string
  username: string
  firstname: string
  secondname: string
  experience: string
  status: string
  role: UserRoleEnum
  rank: RankDto
}

interface AuthState {
  user: User | null
  userFull: UserFull | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

// Helper to get initial state from localStorage
const getInitialRefreshToken = (): string | null => localStorage.getItem('refreshToken')
const getInitialAccessToken = (): string | null => localStorage.getItem('accessToken')
const getInitialUser = (): User | null => {
  const userString = localStorage.getItem('user')
  return userString ? JSON.parse(userString) : null
}
const getInitialUserFull = (): UserFull | null => {
  const userString = localStorage.getItem('userFull')
  return userString ? JSON.parse(userString) : null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: getInitialUser(),
    userFull: getInitialUserFull(),
    accessToken: getInitialAccessToken(),
    refreshToken: getInitialRefreshToken(),
    isAuthenticated: !!getInitialAccessToken(),
  }),

  getters: {
    currentUser: (state): User | null => state.user,
    fullUser: (state): UserFull | null => state.userFull,
    isUserAuthenticated: (state): boolean => state.isAuthenticated,
    getAccessToken: (state): string | null => state.accessToken,
  },

  actions: {
    setAuthData(userData: User, accessToken: string, refreshToken: string) {
      this.user = userData
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.isAuthenticated = true

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    },

    clearAuthData() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false

      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },

    async register(credentials: UserRegisterDto) {
      // Define a proper type for credentials
      try {
        // The backend should ideally not return tokens on registration
        // but rather require login after successful registration + email verification.
        // For this example, let's assume it does for simplicity or you handle it differently.
        const response = await apiClient.post('/auth/register', credentials)
        // If your backend returns user and tokens on register:
        // if (response.data.user && response.data.accessToken && response.data.refreshToken) {
        //   this.setAuthData(response.data.user, response.data.accessToken, response.data.refreshToken);
        // }
        console.log('Registration successful:', response.data)
        // Typically, you'd redirect to login or show a success message
        return response.data
      } catch (error) {
        console.error('Registration error:', error)
        throw error // Re-throw to be caught in the component
      }
    },

    async login(credentials: UserLoginDto) {
      try {
        const response = await apiClient.post('/auth', credentials)
        if (response.data.user && response.data.accessToken && response.data.refreshToken) {
          this.setAuthData(response.data.user, response.data.accessToken, response.data.refreshToken)
          console.log('Login successful, user:', this.user)
          // Navigate to a protected route after login
          await this.fetchUserProfile();
          router.push('/dashboard') // Or your desired authenticated route
        } else {
          throw new Error('Invalid login response from server')
        }
        return response.data
      } catch (error) {
        console.error('Login error:', error)
        this.clearAuthData() // Clear any partial auth data on failed login
        throw error
      }
    },

    async refreshTokenAction(): Promise<string> {
      if (!this.refreshToken) {
        this.logout() // No refresh token, logout
        throw new Error('No refresh token available.')
      }
      try {
        console.log('Attempting to refresh token...')
        const response = await apiClient.post('/auth/refresh', {
          refreshToken: this.refreshToken,
        })

        const newAccessToken = response.data.accessToken;
        // Optionally, the backend might also return a new refresh token
        const newRefreshToken = response.data.refreshToken || this.refreshToken;

        if (newAccessToken) {
          this.accessToken = newAccessToken;
          this.refreshToken = newRefreshToken; // Update if backend sends a new one
          localStorage.setItem('accessToken', newAccessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          console.log('Token refreshed successfully.');
          return newAccessToken;
        } else {
          throw new Error('Failed to refresh token: No new access token received.');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        this.logout(); // If refresh fails, log out the user
        throw error;
      }
    },

    logout() {
      this.clearAuthData()
      // Optionally, call a backend endpoint to invalidate the refresh token
      apiClient.post('/auth/logout', { refreshToken: this.refreshToken });
      console.log('User logged out.')
      router.push('/login') // Redirect to login page
    },

    // Action to fetch user profile if not available or needs update
    async fetchUserProfile() {
      if (!this.isAuthenticated || !this.accessToken) return
      try {
        const response = await apiClient.get<UserFull>('/users') // Example endpoint
        this.user = response.data
        localStorage.setItem('userFull', JSON.stringify(this.user))
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Potentially logout if token is invalid
        if ((error as any).response?.status === 401) {
          this.logout()
        }
      }
    },
  },
})
