// src/router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import your auth store
// ... your view imports

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/signup', name: 'signup', component: () => import('../views/SignUpView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  {
    path: '/dashboard', // Example protected route
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'), // Create this view
    meta: { requiresAuth: true }, // Mark as requiring authentication
  },
  {
    path: '/tasks/create',
    name: 'createTask',
    component: () => import('../views/CreateTaskView.vue'),
    meta: { requiresAuth: true }, // Mark as requiring authentication
  },
  {
    path: '/tasks/:token/edit',
    name: 'editTask',
    component: () => import('../views/CreateTaskView.vue'),
    meta: { requiresAuth: true }, // Mark as requiring authentication
  },
  {
    path: '/tasks/:token',
    name: 'task',
    component: () => import('../views/SolveTaskView.vue'),
    meta: { requiresAuth: true }, // Mark as requiring authentication
  },
  // Add other routes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard
router.beforeEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
    const authStore = useAuthStore()

    // We no longer fetch user profile here - basic user data is only loaded during login
    // If tokens exist but user object is null, we'll rely on the stored tokens for authentication
    if (authStore.isAuthenticated && !authStore.currentUser) {
      console.warn(
        'User is authenticated but user object is null. Using stored tokens for authentication.',
      )
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isUserAuthenticated) {
      // If route requires auth and user is not authenticated, redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } }) // Optional: redirect back after login
    } else if (
      (to.name === 'login' || to.name === 'signup' || to.name === '/') &&
      authStore.isUserAuthenticated
    ) {
      // If user is authenticated and tries to access login/signup, redirect to dashboard
      next({ name: 'dashboard' })
    } else {
      // Otherwise, allow navigation
      next()
    }
  },
)

export default router
