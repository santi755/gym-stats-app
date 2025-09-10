import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import components
import Onboarding from '@/components/Onboarding.vue'
import DailyBoard from '@/components/DailyBoard.vue'
import History from '@/components/History.vue'
import Settings from '@/components/Settings.vue'
import Dashboard from '@/components/Dashboard.vue'
import Auth from '@/components/Auth.vue'

// Import auth utilities
import { getCurrentUser, isSupabaseConfigured } from '@/config/supabase.js'

// Router configuration
const routes = [
  { 
    path: '/', 
    component: DailyBoard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/onboarding', 
    component: Onboarding,
    meta: { requiresAuth: true }
  },
  { 
    path: '/auth', 
    component: Auth,
    meta: { requiresAuth: false }
  },
  { 
    path: '/history', 
    component: History,
    meta: { requiresAuth: true }
  },
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/settings', 
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to handle authentication
router.beforeEach(async (to, from, next) => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    // If not configured and trying to access auth page, allow it
    if (to.path === '/auth') {
      next()
      return
    }
    // Otherwise redirect to auth with configuration warning
    next('/auth')
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    try {
      const user = await getCurrentUser()
      if (!user) {
        // No user, redirect to auth
        next('/auth')
        return
      }
      // User exists, allow navigation
      next()
    } catch (error) {
      console.error('Auth check failed:', error)
      next('/auth')
    }
  } else {
    // Route doesn't require auth, check if user is already authenticated
    if (to.path === '/auth') {
      try {
        const user = await getCurrentUser()
        if (user) {
          // User is already authenticated, redirect to home
          next('/')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    // Allow navigation to non-auth routes
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
