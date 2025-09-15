<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🏋️ Configurar Grupo</h2>
      <p class="text-gray-600">Crea un nuevo grupo, selecciona uno existente o únete a uno</p>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        @click="showCreateForm = true"
        class="btn-primary py-4"
      >
        ➕ Crear Nuevo Grupo
      </button>
      <button
        @click="$router.push('/join-group')"
        class="btn-secondary py-4"
      >
        🤝 Unirse a Grupo
      </button>
    </div>

    <!-- Existing Groups -->
    <div v-if="existingGroups.length > 0" class="card">
      <h3 class="text-lg font-semibold mb-4">Mis Grupos</h3>
      <div class="space-y-3">
        <div
          v-for="group in existingGroups"
          :key="group.id"
          class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          :class="selectedGroupId === group.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
        >
          <div class="flex-1">
                         <h4 class="font-medium text-gray-900">{{ group.name }}</h4>
             <p v-if="group.description" class="text-sm text-gray-600">{{ group.description }}</p>
             <div class="flex items-center space-x-4 mt-2">
               <p class="text-xs text-gray-500">
                 Creado: {{ formatDate(group.created_at) }}
               </p>
               <div class="flex items-center space-x-2">
                 <span class="text-xs text-gray-500">Código:</span>
                 <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{{ group.invite_code }}</code>
                 <button
                   @click="copyInviteCode(group.invite_code)"
                   class="text-xs text-blue-600 hover:text-blue-700"
                   title="Copiar código"
                 >
                   📋
                 </button>
               </div>
             </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="selectGroup(group.id)"
              class="btn-primary text-sm"
              :disabled="loading"
            >
              {{ selectedGroupId === group.id ? 'Seleccionado' : 'Seleccionar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create New Group -->
    <div v-if="showCreateForm" class="card">
      <h3 class="text-lg font-semibold mb-4">Crear Nuevo Grupo</h3>
      <form @submit.prevent="createNewGroup" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
          <input
            v-model="newGroup.name"
            type="text"
            required
            class="input-field"
            placeholder="Mi Grupo de Gym"
            maxlength="50"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
          <textarea
            v-model="newGroup.description"
            class="input-field"
            placeholder="Descripción del grupo..."
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
        <button
          type="submit"
          :disabled="loading || !newGroup.name.trim()"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Creando...' : 'Crear Grupo' }}
        </button>
      </form>
    </div>

    <!-- Continue Button -->
    <div v-if="selectedGroupId" class="text-center">
      <button
        @click="continueToApp"
        :disabled="loading"
        class="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Configurando...' : 'Continuar' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="card bg-red-50 border-red-200">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Tips -->
    <div class="card bg-blue-50 border-blue-200">
      <h4 class="font-semibold text-blue-900 mb-2">💡 ¿Qué es un grupo?</h4>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Un grupo contiene a todos los participantes del gym</li>
        <li>• Puedes tener múltiples grupos (familia, amigos, etc.)</li>
        <li>• Los datos se mantienen separados entre grupos</li>
        <li>• Puedes cambiar de grupo en cualquier momento desde Configuración</li>
      </ul>
    </div>

    <!-- Logout Option -->
    <div class="text-center pt-4 border-t border-gray-200">
      <button
        @click="logout"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { supabase } from '../config/httpConfig.js'
import { useUserStore } from '@/stores/UserStore.js'

export default {
  name: 'GroupSetup',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const existingGroups = ref([])
    const selectedGroupId = ref('')
    const loading = ref(false)
    const error = ref('')
    const showCreateForm = ref(false)

    const newGroup = ref({
      name: '',
      description: ''
    })

    onMounted(async () => {
      try {
        const user = userStore.getUser
        if (!user) {
          router.push('/auth')
          return
        }

        await loadGroups()
      } catch (err) {
        console.error('Error initializing group setup:', err)
        error.value = 'Error al cargar grupos: ' + err.message
      }
    })

    const loadGroups = async () => {
      try {
        const groups = await storage.getGroups()
        existingGroups.value = groups
        
        // If user has a current group, select it
        const currentGroup = userStore.getGroup
        if (currentGroup) {
          selectedGroupId.value = currentGroup
        }
      } catch (err) {
        console.error('Error loading groups:', err)
        error.value = 'Error al cargar grupos: ' + err.message
      }
    }

    const selectGroup = async (groupId) => {
      try {
        loading.value = true
        error.value = ''
        
        await storage.setCurrentGroup(groupId)
        selectedGroupId.value = groupId
      } catch (err) {
        console.error('Error selecting group:', err)
        error.value = 'Error al seleccionar grupo: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const createNewGroup = async () => {
      if (!newGroup.value.name.trim()) return

      try {
        loading.value = true
        error.value = ''

        const group = await storage.createGroup(
          newGroup.value.name.trim(),
          newGroup.value.description.trim()
        )

        selectedGroupId.value = group.id
        await loadGroups()

        // Clear form
        newGroup.value.name = ''
        newGroup.value.description = ''
        showCreateForm.value = false
      } catch (err) {
        console.error('Error creating group:', err)
        error.value = 'Error al crear grupo: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const continueToApp = async () => {
      if (!selectedGroupId.value) return

      try {
        loading.value = true
        error.value = ''

        // Ensure the group is set as current
        await storage.setCurrentGroup(selectedGroupId.value)
        
        // Check if group has users, if not go to onboarding
        const users = await storage.getUsers()
        if (users.length === 0) {
          router.push('/onboarding')
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error('Error continuing to app:', err)
        error.value = 'Error al continuar: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const copyInviteCode = async (inviteCode) => {
      try {
        await navigator.clipboard.writeText(inviteCode)
        // Could add a toast notification here
        console.log('Código copiado:', inviteCode)
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }

    const logout = async () => {
      try {
        await supabase.auth.signOut()
        router.push('/auth')
      } catch (err) {
        console.error('Error logging out:', err)
      }
    }

    return {
      existingGroups,
      selectedGroupId,
      loading,
      error,
      showCreateForm,
      newGroup,
      selectGroup,
      createNewGroup,
      continueToApp,
      copyInviteCode,
      formatDate,
      logout
    }
  }
}
</script> 