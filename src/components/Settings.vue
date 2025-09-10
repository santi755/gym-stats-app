<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Configuración</h2>
      <p class="text-gray-600">Gestiona participantes y datos</p>
    </div>

    <!-- Current Group -->
    <div class="card">
      <h3 class="font-semibold mb-4">Grupo Actual</h3>
      <p class="text-sm text-gray-600 mb-3">Cambia entre tus grupos o crea uno nuevo.</p>
      
      <div class="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200 mb-3">
        <div>
          <p class="font-medium text-blue-900">{{ currentGroupName || 'Cargando...' }}</p>
          <p class="text-sm text-blue-700">Grupo activo</p>
        </div>
      </div>
      
      <button
        @click="goToGroupSetup"
        class="w-full btn-secondary"
      >
        Cambiar Grupo
      </button>
    </div>

    <!-- Manage Users -->
    <div class="card">
      <h3 class="font-semibold mb-4">Miembros del Grupo</h3>
      
      <p class="text-sm text-gray-600 mb-4">
        Para agregar nuevos miembros, comparte el código de invitación del grupo.
      </p>

      <!-- Users list -->
      <div class="space-y-2">
        <div
          v-for="user in users"
          :key="getUserId(user)"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              :style="{ backgroundColor: user.color }"
            >
              {{ getUserName(user).charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="font-medium">{{ getUserName(user) }}</span>
              <p class="text-sm text-gray-600">{{ userTotals[getUserId(user)] || 0 }} puntos totales</p>
              <span v-if="getUserId(user) === currentUserId" class="text-xs text-blue-600">(Tú)</span>
              <span v-if="user.role === 'owner'" class="text-xs text-green-600">(Creador)</span>
            </div>
          </div>
          <div class="flex gap-1" v-if="getUserId(user) === currentUserId">
            <button
              @click="editUser(user)"
              class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              title="Editar mi perfil"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="removeUser(getUserId(user))"
              class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              title="Salir del grupo"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Current User Selection (hidden in new system) -->
    <div class="card" v-if="false">
      <h3 class="font-semibold mb-4">Usuario Actual</h3>
      <p class="text-sm text-gray-600 mb-3">En el nuevo sistema, automáticamente eres tú mismo.</p>
    </div>

    <!-- Export/Import -->
    <div class="card">
      <h3 class="font-semibold mb-4">Exportar/Importar</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          @click="exportJSON"
          class="btn-secondary"
        >
          📄 Exportar JSON
        </button>
        <button
          @click="exportCSV"
          class="btn-secondary"
        >
          📊 Exportar CSV
        </button>
      </div>
      
      <p class="text-xs text-gray-500 mt-2">
        En el sistema de invitaciones, la importación no está disponible. Los usuarios deben unirse mediante códigos.
      </p>
    </div>

    <!-- Danger Zone -->
    <div class="card border-red-200 bg-red-50">
      <h3 class="font-semibold text-red-900 mb-4">Zona de Peligro</h3>
      
      <div class="space-y-3">
        <button
          @click="resetAllData"
          class="w-full btn-danger"
        >
          Borrar Mis Datos
        </button>
        
        <p class="text-sm text-red-700">
          ⚠️ Esto eliminará solo tus entradas de puntos, no afectará a otros miembros del grupo.
        </p>
      </div>
    </div>

    <!-- App Info -->
    <div class="card bg-gray-50">
      <h3 class="font-semibold mb-3">Información de la App</h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Versión:</strong> 2.0.0 (Sistema de Invitaciones)</p>
        <p><strong>Almacenamiento:</strong> {{ storageMode }}</p>
        <p><strong>Datos creados:</strong> {{ appInfo.createdAt }}</p>
        <p><strong>Última modificación:</strong> {{ appInfo.lastModified }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { getCurrentUser } from '../config/supabase.js'

export default {
  name: 'Settings',
  setup() {
    const router = useRouter()
    const users = ref([])
    const newUserName = ref('')
    const newUserColor = ref('#3b82f6')
    const currentUserId = ref('')
    const currentGroupName = ref('')
    const userTotals = ref({})
    const appInfo = ref({})
    const isOnline = ref(navigator.onLine)
    const isAuthenticated = ref(false)

    // Helper functions for compatibility
    const getUserName = (user) => {
      return user.display_name || user.name || 'Usuario'
    }

    const getUserId = (user) => {
      return user.user_id || user.id
    }

    // Computed properties
    const storageMode = computed(() => {
      return 'Supabase (Nube) - Sistema de Invitaciones'
    })

    onMounted(async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        currentUserId.value = user.id
        isAuthenticated.value = true
        await loadUsers()
        await loadCurrentGroup()
        await loadAppInfo()

        // Listen for online/offline events
        window.addEventListener('online', () => {
          isOnline.value = true
        })
        window.addEventListener('offline', () => {
          isOnline.value = false
        })
      } catch (error) {
        console.error('Error initializing settings:', error)
        router.push('/auth')
      }
    })

    const loadUsers = async () => {
      try {
        users.value = await storage.getUsers()
        await loadUserTotals()
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const loadUserTotals = async () => {
      try {
        const totals = {}
        for (const user of users.value) {
          const userId = getUserId(user)
          totals[userId] = await storage.getUserTotal(userId)
        }
        userTotals.value = totals
      } catch (error) {
        console.error('Error loading user totals:', error)
      }
    }

    const loadCurrentGroup = async () => {
      try {
        const groups = await storage.getGroups()
        const currentGroupId = await storage.getCurrentGroup()
        const currentGroup = groups.find(g => g.id === currentGroupId)
        currentGroupName.value = currentGroup?.name || 'Sin grupo'
      } catch (error) {
        console.error('Error loading current group:', error)
        currentGroupName.value = 'Error al cargar'
      }
    }

    const loadAppInfo = async () => {
      try {
        const totalDays = await storage.getTotalActiveDays()
        appInfo.value = {
          createdAt: 'N/A',
          lastModified: new Date().toLocaleDateString('es-ES'),
          totalDays
        }
      } catch (error) {
        console.error('Error loading app info:', error)
      }
    }

    const addUser = async () => {
      alert('En el sistema de invitaciones, los usuarios se unen mediante códigos. Ve a "Cambiar Grupo" para ver el código de invitación.')
    }

    const editUser = async (user) => {
      const currentName = getUserName(user)
      const newName = prompt('Nuevo nombre:', currentName)
      if (newName && newName.trim() && newName !== currentName) {
        try {
          const userId = getUserId(user)
          await storage.updateUser(userId, { display_name: newName.trim() })
          await loadUsers()
        } catch (error) {
          alert('Error al actualizar usuario: ' + error.message)
        }
      }
    }

    const removeUser = async (userId) => {
      if (userId === currentUserId.value) {
        if (confirm('¿Estás seguro de que quieres salir de este grupo? Perderás acceso a todos los datos del grupo.')) {
          try {
            await storage.deleteUser(userId)
            router.push('/groups')
          } catch (error) {
            alert('Error al salir del grupo: ' + error.message)
          }
        }
      }
    }

    const updateCurrentUser = async () => {
      // Not needed in new system - users are always themselves
      return true
    }

    const goToGroupSetup = () => {
      router.push('/groups')
    }

    const exportJSON = async () => {
      try {
        await storage.exportJSON()
      } catch (error) {
        alert('Error al exportar: ' + error.message)
      }
    }

    const exportCSV = async () => {
      try {
        await storage.exportCSV()
      } catch (error) {
        alert('Error al exportar: ' + error.message)
      }
    }

    const resetAllData = async () => {
      if (confirm('¿Estás seguro de que quieres borrar todos tus datos de puntos? Esta acción no se puede deshacer.')) {
        try {
          await storage.clearAllData()
          await loadUsers()
          alert('Tus datos han sido eliminados correctamente.')
        } catch (error) {
          alert('Error al borrar datos: ' + error.message)
        }
      }
    }

    return {
      users,
      newUserName,
      newUserColor,
      currentUserId,
      currentGroupName,
      userTotals,
      appInfo,
      isOnline,
      isAuthenticated,
      storageMode,
      getUserName,
      getUserId,
      loadCurrentGroup,
      addUser,
      editUser,
      removeUser,
      updateCurrentUser,
      goToGroupSetup,
      exportJSON,
      exportCSV,
      resetAllData,
      isSupabaseConfigured: true
    }
  }
}
</script>
