<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Configuración</h2>
      <p class="text-gray-600">Gestiona participantes y datos</p>
    </div>

    <!-- Manage Users -->
    <div class="card">
      <h3 class="font-semibold mb-4">Gestionar Participantes</h3>
      
      <!-- Add new user form -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newUserName"
          type="text"
          placeholder="Nombre del participante"
          class="input-field flex-1"
          @keyup.enter="addUser"
        />
        <input
          v-model="newUserColor"
          type="color"
          class="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
        <button
          @click="addUser"
          :disabled="!newUserName.trim()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>

      <!-- Users list -->
      <div class="space-y-2">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              :style="{ backgroundColor: user.color }"
            >
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="font-medium">{{ user.name }}</span>
              <p class="text-sm text-gray-600">{{ getUserTotal(user.id) }} puntos totales</p>
            </div>
          </div>
          <div class="flex gap-1">
            <button
              @click="editUser(user)"
              class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="removeUser(user.id)"
              class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export/Import -->
    <div class="card">
      <h3 class="font-semibold mb-4">Exportar / Importar Datos</h3>
      
      <div class="space-y-3">
        <div class="flex gap-2">
          <button @click="exportJSON" class="flex-1 btn-primary">
            Exportar JSON
          </button>
          <button @click="exportCSV" class="flex-1 btn-secondary">
            Exportar CSV
          </button>
        </div>
        
        <div>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="importJSON"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            class="w-full btn-secondary"
          >
            Importar JSON
          </button>
        </div>
      </div>

      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-2">💡 Consejos de respaldo:</h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Exporta regularmente para no perder datos</li>
          <li>• Si cambias de dispositivo, exporta e importa</li>
          <li>• El JSON contiene todos los datos</li>
          <li>• El CSV es útil para análisis en Excel</li>
        </ul>
      </div>
    </div>

    <!-- Current User -->
    <div class="card">
      <h3 class="font-semibold mb-4">Usuario Actual</h3>
      <p class="text-sm text-gray-600 mb-3">Selecciona tu identidad para que la app te reconozca automáticamente.</p>
      
      <div class="space-y-2">
        <label
          v-for="user in users"
          :key="user.id"
          class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
          :class="currentUserId === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
        >
          <input
            v-model="currentUserId"
            type="radio"
            :value="user.id"
            class="sr-only"
            @change="updateCurrentUser"
          />
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3"
            :style="{ backgroundColor: user.color }"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <span class="font-medium">{{ user.name }}</span>
        </label>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card border-red-200 bg-red-50">
      <h3 class="font-semibold text-red-900 mb-4">Zona de Peligro</h3>
      
      <div class="space-y-3">
        <button
          @click="resetAllData"
          class="w-full btn-danger"
        >
          Borrar Todos los Datos
        </button>
        
        <p class="text-sm text-red-700">
          ⚠️ Esta acción eliminará todos los datos permanentemente. 
          Asegúrate de exportar antes de continuar.
        </p>
      </div>
    </div>

    <!-- Supabase Status -->
    <div class="card">
      <h3 class="font-semibold mb-3">🔄 Sincronización</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Estado de conexión:</span>
          <span class="text-sm font-medium" :class="isOnline ? 'text-green-600' : 'text-red-600'">
            {{ isOnline ? '🟢 En línea' : '🔴 Sin conexión' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Supabase:</span>
          <span class="text-sm font-medium" :class="isSupabaseConfigured ? 'text-green-600' : 'text-yellow-600'">
            {{ isSupabaseConfigured ? '✅ Configurado' : '⚠️ No configurado' }}
          </span>
        </div>
        <div v-if="isSupabaseConfigured" class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Usuario:</span>
          <span class="text-sm font-medium" :class="isAuthenticated ? 'text-green-600' : 'text-gray-600'">
            {{ isAuthenticated ? '✅ Autenticado' : '❌ No autenticado' }}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            @click="syncData"
            :disabled="!isOnline"
            class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sincronizar Datos
          </button>
          <router-link
            to="/auth"
            class="flex-1 btn-secondary text-center"
          >
            {{ isAuthenticated ? 'Gestionar Cuenta' : 'Iniciar Sesión' }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- App Info -->
    <div class="card bg-gray-50">
      <h3 class="font-semibold mb-3">Información de la App</h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Versión:</strong> 1.0.0</p>
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
    const appInfo = ref({})
    const isOnline = ref(navigator.onLine)
    const isAuthenticated = ref(false)

    // Computed properties
    const storageMode = computed(() => {
      return 'Supabase (Nube)'
    })

    onMounted(async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        isAuthenticated.value = true
        await loadUsers()
        currentUserId.value = localStorage.getItem('currentUserId') || ''
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
      } catch (error) {
        console.error('Error loading users:', error)
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
      if (!newUserName.value.trim()) return
      
      try {
        const user = await storage.addUser(newUserName.value.trim(), newUserColor.value)
        users.value.push(user)
        newUserName.value = ''
        newUserColor.value = '#3b82f6'
      } catch (error) {
        alert('Error al agregar usuario: ' + error.message)
      }
    }

    const editUser = async (user) => {
      const newName = prompt('Nuevo nombre:', user.name)
      if (newName && newName.trim() && newName !== user.name) {
        try {
          await storage.updateUser(user.id, { name: newName.trim() })
          await loadUsers()
        } catch (error) {
          alert('Error al actualizar usuario: ' + error.message)
        }
      }
    }

    const removeUser = async (userId) => {
      const user = users.value.find(u => u.id === userId)
      if (confirm(`¿Estás seguro de que quieres eliminar a ${user?.name}? Esta acción eliminará todos sus datos.`)) {
        try {
          await storage.deleteUser(userId)
          users.value = users.value.filter(u => u.id !== userId)
          
          if (currentUserId.value === userId) {
            currentUserId.value = ''
          }
        } catch (error) {
          alert('Error al eliminar usuario: ' + error.message)
        }
      }
    }

    const updateCurrentUser = () => {
      if (currentUserId.value) {
        localStorage.setItem('currentUserId', currentUserId.value)
      }
    }

    const importJSON = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const mode = confirm('¿Quieres fusionar con los datos existentes? (Cancelar = reemplazar)') ? 'merge' : 'replace'
      
      try {
        await storage.importJSON(file, mode)
        alert('Datos importados correctamente')
        await loadUsers()
        await loadAppInfo()
      } catch (error) {
        alert('Error al importar: ' + error.message)
      }
      
      // Reset file input
      event.target.value = ''
    }

    const resetAllData = async () => {
      if (confirm('¿Estás SEGURO de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
        if (confirm('Última confirmación: ¿Borrar todos los datos?')) {
          try {
            await storage.clearAllData()
            alert('Todos los datos han sido eliminados. La app se recargará.')
            window.location.reload()
          } catch (error) {
            alert('Error al borrar datos: ' + error.message)
          }
        }
      }
    }

    const syncData = async () => {
      try {
        await loadUsers()
        await loadAppInfo()
        alert('Datos actualizados correctamente')
      } catch (error) {
        alert('Error al actualizar datos: ' + error.message)
      }
    }

    return {
      users,
      newUserName,
      newUserColor,
      currentUserId,
      appInfo,
      isOnline,
      isAuthenticated,
      storageMode,
      addUser,
      editUser,
      removeUser,
      updateCurrentUser,
      exportJSON: storage.exportJSON,
      exportCSV: storage.exportCSV,
      importJSON,
      resetAllData,
      syncData,
      getUserTotal: storage.getUserTotal,
      isSupabaseConfigured: true
    }
  }
}
</script>
