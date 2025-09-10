<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🤝 Unirse a Grupo</h2>
      <p class="text-gray-600">Ingresa el código de invitación para unirte a un grupo existente</p>
    </div>

    <!-- Join by Code Form -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Código de Invitación</h3>
      <form @submit.prevent="joinByCode" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Código de Invitación</label>
          <input
            v-model="inviteCode"
            type="text"
            required
            class="input-field"
            placeholder="ABC123XY"
            maxlength="8"
            style="text-transform: uppercase"
            @input="inviteCode = inviteCode.toUpperCase()"
          />
          <p class="text-xs text-gray-500 mt-1">
            El código te lo proporciona el creador del grupo
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tu Nombre en el Grupo</label>
          <input
            v-model="displayName"
            type="text"
            required
            class="input-field"
            placeholder="Tu nombre"
            maxlength="30"
          />
          <p class="text-xs text-gray-500 mt-1">
            Así te verán los otros miembros del grupo
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div class="flex items-center space-x-3">
            <input
              v-model="color"
              type="color"
              class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
            <span class="text-sm text-gray-600">Elige tu color personalizado</span>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading || !inviteCode.trim() || !displayName.trim()"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Uniéndose...' : 'Unirse al Grupo' }}
        </button>
      </form>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="card bg-green-50 border-green-200">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="text-green-800 font-medium">{{ successMessage }}</p>
      </div>
      <p class="text-green-700 text-sm mt-2">¡Ya puedes empezar a registrar tus entrenamientos!</p>
      <p class="text-green-600 text-xs mt-1">Redirigiendo automáticamente en 2 segundos...</p>
      
      <button
        @click="goToApp"
        class="mt-3 btn-primary text-sm"
      >
        Ir a la App Ahora
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="card bg-red-50 border-red-200">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Back to Groups -->
    <div class="text-center">
      <button
        @click="$router.push('/groups')"
        class="btn-secondary"
      >
        ← Volver a Mis Grupos
      </button>
    </div>

    <!-- Help -->
    <div class="card bg-blue-50 border-blue-200">
      <h4 class="font-semibold text-blue-900 mb-2">💡 ¿Cómo funciona?</h4>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Pídele el código de invitación al creador del grupo</li>
        <li>• El código son 8 caracteres (letras y números)</li>
        <li>• Una vez dentro, podrás registrar tus entrenamientos</li>
        <li>• Solo tú puedes editar tus propios puntos</li>
        <li>• Verás el progreso de todos los miembros del grupo</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { joinGroupByInviteCode, getCurrentUser } from '../config/supabase.js'

export default {
  name: 'JoinGroup',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')

    const inviteCode = ref('')
    const displayName = ref('')
    const color = ref('#3b82f6')

    // Set default display name from user email if available
    const initializeForm = async () => {
      try {
        const user = await getCurrentUser()
        if (user && user.email) {
          displayName.value = user.email.split('@')[0]
        }
      } catch (err) {
        console.error('Error getting user:', err)
      }
    }

    initializeForm()

    const joinByCode = async () => {
      if (!inviteCode.value.trim() || !displayName.value.trim()) return

      try {
        loading.value = true
        error.value = ''
        successMessage.value = ''

        const result = await joinGroupByInviteCode(
          inviteCode.value.trim(),
          displayName.value.trim(),
          color.value
        )

        successMessage.value = `¡Te has unido exitosamente al grupo "${result.group.name}"!`
        
        // Clear form
        inviteCode.value = ''
        displayName.value = ''
        color.value = '#3b82f6'

        // Auto-redirect to app after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)

      } catch (err) {
        console.error('Error joining group:', err)
        error.value = err.message || 'Error al unirse al grupo'
      } finally {
        loading.value = false
      }
    }

    const goToApp = () => {
      router.push('/')
    }

    return {
      loading,
      error,
      successMessage,
      inviteCode,
      displayName,
      color,
      joinByCode,
      goToApp
    }
  }
}
</script> 