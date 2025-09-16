import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia'

// Import components
import Onboarding from '@/components/Onboarding.vue'
import DailyBoard from '@/components/DailyBoard.vue'
import History from '@/components/History.vue'
import Settings from '@/components/Settings.vue'
import Dashboard from '@/components/Dashboard.vue'
import Auth from '@/components/Auth.vue'
import GroupSetup from '@/components/GroupSetup.vue'
import JoinGroup from '@/components/JoinGroup.vue'

// Import auth utilities
import { isSupabaseConfigured } from '@/config/httpConfig.js'
import { storage } from '@/services/storage.js'
import { useUserStore } from '@/stores/UserStore.js'

// Router configuration
const routes = [
  {
    path: '/',
    component: DailyBoard,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups',
    component: GroupSetup,
    meta: { requiresAuth: true },
  },
  {
    path: '/join-group',
    component: JoinGroup,
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding',
    component: Onboarding,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    component: Auth,
    meta: { requiresAuth: false },
  },
  {
    path: '/history',
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
]

// Create Pinia store
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard to handle authentication and group setup
router.beforeEach(async (to, from, next) => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured')
    // If not configured and trying to access auth page, allow it
    if (to.path === '/auth') {
      next()
      return
    }
    // Otherwise redirect to auth with configuration warning
    next('/auth')
    return
  }

  await useUserStore().fetchUser()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Route requires auth')
    try {
      const user = useUserStore().user
      console.log('Middleware user', user)
      if (!user) {
        // No user, redirect to auth
        console.log('No user, redirecting to auth')
        next('/auth')
        return
      }

      // User exists, check if they need group setup (except for group-related pages)
      const groupSetupRoutes = ['/groups', '/join-group']
      if (!groupSetupRoutes.includes(to.path)) {
        console.log('No group setup routes, checking group')
        try {
          const currentGroup = await storage.getCurrentGroup()
          if (!currentGroup) {
            // No group selected, redirect to group setup
            console.log('No group selected, redirecting to group setup')
            next('/groups')
            return
          }
        } catch (error) {
          console.error('Error checking group:', error)
          // If there's an error checking groups, go to group setup
          console.log('Error checking group, redirecting to group setup')
          next('/groups')
          return
        }
      }

      // User exists and has group (or is going to groups page), allow navigation
      console.log('User exists and has group, allowing navigation')
      next()
    } catch (error) {
      console.error('Auth check failed:', error)
      console.log('Auth check failed, redirecting to auth')
      next('/auth')
    }
  } else {
    // Route doesn't require auth, check if user is already authenticated
    console.log("Route doesn't require auth, checking if user is already authenticated")
    if (to.path === '/auth') {
      try {
        const user = useUserStore().user
        if (user) {
          // User is already authenticated, check if they have a group
          try {
            const currentGroup = await storage.getCurrentGroup()
            if (!currentGroup) {
              console.log('No group selected, redirecting to group setup')
              next('/groups')
              return
            }
            // User has group, redirect to home
            console.log('User has group, redirecting to home')
            next('/')
            return
          } catch {
            // Error checking group, go to group setup
            console.log('Error checking group, redirecting to group setup')
            next('/groups')
            return
          }
        }
      } catch {
        console.error('Auth check failed')
        console.log('Auth check failed, redirecting to auth')
        next('/auth')
      }
    }
    // Allow navigation to non-auth routes
    console.log('Allowing navigation to non-auth routes')
    next()
  }
})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
