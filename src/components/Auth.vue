<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🔐 Autenticación</h2>
      <p class="text-gray-600">Inicia sesión o regístrate para sincronizar tus datos</p>
    </div>

    <!-- Auth Tabs -->
    <div class="card">
      <div class="flex border-b border-gray-200 mb-4">
        <button
          @click="activeTab = 'signin'"
          class="flex-1 py-2 px-4 text-center font-medium transition-colors"
          :class="activeTab === 'signin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'"
        >
          Iniciar Sesión
        </button>
        <button
          @click="activeTab = 'signup'"
          class="flex-1 py-2 px-4 text-center font-medium transition-colors"
          :class="activeTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'"
        >
          Registrarse
        </button>
      </div>

      <!-- Sign In Form -->
      <form v-if="activeTab === 'signin'" @submit.prevent="handleSignIn" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="signInForm.email"
            type="email"
            required
            :disabled="loading"
            class="input-field"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            placeholder="tu@email.com"
          />
        </div>
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="signInForm.password"
            :type="showSignInPassword ? 'text' : 'password'"
            required
            :disabled="loading"
            class="input-field pr-10"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showSignInPassword = !showSignInPassword"
            :disabled="loading"
            class="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="showSignInPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <!-- Loading Spinner -->
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <!-- Button Text -->
          <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
        </button>
      </form>

      <!-- Sign Up Form -->
      <form v-if="activeTab === 'signup'" @submit.prevent="handleSignUp" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="signUpForm.email"
            type="email"
            required
            :disabled="loading"
            class="input-field"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            placeholder="tu@email.com"
          />
        </div>
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="signUpForm.password"
            :type="showSignUpPassword ? 'text' : 'password'"
            required
            minlength="6"
            :disabled="loading"
            class="input-field pr-10"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showSignUpPassword = !showSignUpPassword"
            :disabled="loading"
            class="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="showSignUpPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
          <input
            v-model="signUpForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            :disabled="loading"
            class="input-field pr-10"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            :disabled="loading"
            class="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading || signUpForm.password !== signUpForm.confirmPassword"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <!-- Loading Spinner -->
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <!-- Button Text -->
          <span>{{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 text-sm">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-800 text-sm">{{ success }}</p>
      </div>
    </div>

    <!-- Offline Mode -->
    <div class="card bg-gray-50 border-gray-200">
      <h3 class="font-semibold text-gray-900 mb-2">📱 Modo Offline</h3>
      <p class="text-sm text-gray-600 mb-4">
        Puedes usar la app sin cuenta. Los datos se guardarán solo en tu dispositivo.
      </p>
      <button
        @click="useOfflineMode"
        :disabled="loading"
        class="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar Sin Cuenta
      </button>
    </div>

    <!-- Supabase Status -->
    <div v-if="!isSupabaseConfigured" class="card bg-yellow-50 border-yellow-200">
      <h3 class="font-semibold text-yellow-900 mb-2">⚠️ Supabase No Configurado</h3>
      <p class="text-sm text-yellow-800 mb-2">
        Para usar la sincronización, configura las variables de entorno:
      </p>
      <ul class="text-xs text-yellow-700 space-y-1">
        <li>• VITE_SUPABASE_URL</li>
        <li>• VITE_SUPABASE_ANON_KEY</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isSupabaseConfigured } from '@/config/httpConfig.js'
import {useUserStore} from '@/stores/UserStore.js'

export default {
  name: 'Auth',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const activeTab = ref('signin')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    // Password visibility states
    const showSignInPassword = ref(false)
    const showSignUpPassword = ref(false)
    const showConfirmPassword = ref(false)

    const signInForm = ref({
      email: '',
      password: ''
    })

    const signUpForm = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const handleSignIn = async () => {
      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const { data, error: authError } = await userStore.signInUser(
          signInForm.value.email,
          signInForm.value.password
        )

        if (authError) throw authError

        success.value = '¡Sesión iniciada correctamente!'
        
        // Redirect to groups setup after successful login
        router.push('/groups')
      } catch (err) {
        error.value = err.message || 'Error al iniciar sesión'
      } finally {
        loading.value = false
      }
    }

    const handleSignUp = async () => {
      if (signUpForm.value.password !== signUpForm.value.confirmPassword) {
        error.value = 'Las contraseñas no coinciden'
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const { data, error: authError } = await userStore.signUpUser(
          signUpForm.value.email,
          signUpForm.value.password
        )

        if (authError) throw authError

        success.value = '¡Cuenta creada! Revisa tu email para confirmar.'
        
        activeTab.value = 'signin'
        signInForm.value.email = signUpForm.value.email
      } catch (err) {
        error.value = err.message || 'Error al crear la cuenta'
      } finally {
        loading.value = false
      }
    }

    const useOfflineMode = () => {
      router.push('/groups')
    }

    // Note: Authentication check is now handled by router guards
    // No need to check here as the router will redirect if user is already authenticated

    return {
      userStore,
      activeTab,
      loading,
      error,
      success,
      signInForm,
      signUpForm,
      showSignInPassword,
      showSignUpPassword,
      showConfirmPassword,
      handleSignIn,
      handleSignUp,
      useOfflineMode,
      isSupabaseConfigured: isSupabaseConfigured()
    }
  }
}
</script>
