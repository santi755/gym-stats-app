<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-md mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Gym Stats</h1>
            <p v-if="currentUser" class="text-xs text-gray-500">{{ currentUser.email }}</p>
          </div>
          <div class="flex space-x-2">
            <router-link 
              to="/" 
              class="p-2 rounded-lg transition-colors"
              :class="$route.path === '/' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </router-link>
            <router-link 
              to="/dashboard" 
              class="p-2 rounded-lg transition-colors"
              :class="$route.path === '/dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </router-link>
            <router-link 
              to="/history" 
              class="p-2 rounded-lg transition-colors"
              :class="$route.path === '/history' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </router-link>
            <router-link 
              to="/auth" 
              class="p-2 rounded-lg transition-colors"
              :class="$route.path === '/auth' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </router-link>
            <router-link 
              to="/settings" 
              class="p-2 rounded-lg transition-colors"
              :class="$route.path === '/settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Configuration Warning -->
    <div v-if="showConfigWarning" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 my-4 rounded">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            <strong>Supabase no está configurado.</strong> 
            Por favor, revisa el archivo <code class="bg-yellow-100 px-1 rounded">SUPABASE_SETUP.md</code> 
            para las instrucciones de configuración.
          </p>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="max-w-md mx-auto px-4 py-4 text-center text-sm text-gray-500">
      <p>Gym Stats App v1.0</p>
    </footer>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { isSupabaseConfigured, getCurrentUser } from '@/config/supabase.js'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const currentUser = ref(null)
    
    // Show configuration warning if Supabase is not configured
    const showConfigWarning = computed(() => {
      return !isSupabaseConfigured() && route.path !== '/auth'
    })

    // Load current user
    const loadCurrentUser = async () => {
      try {
        if (isSupabaseConfigured()) {
          currentUser.value = await getCurrentUser()
        }
      } catch (error) {
        console.log('No user logged in')
        currentUser.value = null
      }
    }

    onMounted(loadCurrentUser)

    return {
      showConfigWarning,
      currentUser
    }
  }
}
</script>
