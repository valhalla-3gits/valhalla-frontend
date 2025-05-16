// src/router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import your auth store
// ... your view imports

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/signup', name: 'signup', component: () => import('../views/SignUpView.vue') },
  {
    path: '/dashboard', // Example protected route
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'), // Create this view
    meta: { requiresAuth: true }, // Mark as requiring authentication
  },
  // Add other routes
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
  const authStore = useAuthStore();

  // Attempt to fetch user profile if authenticated but user object is null (e.g., after page refresh)
  // This ensures the user object is populated if tokens are still valid.
  if (authStore.isAuthenticated && !authStore.currentUser) {
    try {
      await authStore.fetchUserProfile();
    } catch (error: any) {
      // If fetching profile fails (e.g., token expired server-side), logout might occur in fetchUserProfile
      console.warn("Could not fetch user profile on navigation guard.");
    }
  }


  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isUserAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next({ name: 'login', query: { redirect: to.fullPath } }); // Optional: redirect back after login
  } else if ((to.name === 'login' || to.name === 'signup') && authStore.isUserAuthenticated) {
    // If user is authenticated and tries to access login/signup, redirect to dashboard
    next({ name: 'dashboard' });
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router;
