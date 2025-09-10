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
            class="input-field"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="signInForm.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
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
            class="input-field"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="signUpForm.password"
            type="password"
            required
            minlength="6"
            class="input-field"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
          <input
            v-model="signUpForm.confirmPassword"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          :disabled="loading || signUpForm.password !== signUpForm.confirmPassword"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
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
        class="w-full btn-secondary"
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
import { supabase, isSupabaseConfigured, signIn, signUp } from '@/config/supabase.js'

export default {
  name: 'Auth',
  setup() {
    const router = useRouter()
    const activeTab = ref('signin')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

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
        const { data, error: authError } = await signIn(
          signInForm.value.email,
          signInForm.value.password
        )

        if (authError) throw authError

        success.value = '¡Sesión iniciada correctamente!'
        
        // Redirect to groups setup after successful login
        setTimeout(() => {
          router.push('/groups')
        }, 1000)

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
        const { data, error: authError } = await signUp(
          signUpForm.value.email,
          signUpForm.value.password
        )

        if (authError) throw authError

        success.value = '¡Cuenta creada! Revisa tu email para confirmar.'
        
        // Switch to sign in tab
        setTimeout(() => {
          activeTab.value = 'signin'
          signInForm.value.email = signUpForm.value.email
        }, 2000)

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
      activeTab,
      loading,
      error,
      success,
      signInForm,
      signUpForm,
      handleSignIn,
      handleSignUp,
      useOfflineMode,
      isSupabaseConfigured: isSupabaseConfigured()
    }
  }
}
</script>
