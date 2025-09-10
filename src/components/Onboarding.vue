<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido a Gym Stats!</h2>
      <p class="text-gray-600">Configura tu grupo para empezar a llevar la cuenta de puntos de asistencia al gimnasio.</p>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Configurar Participantes</h3>
      
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
      <div v-if="users.length > 0" class="space-y-2">
        <h4 class="font-medium text-gray-700">Participantes:</h4>
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
            <span class="font-medium">{{ user.name }}</span>
          </div>
          <button
            @click="removeUser(user.id)"
            class="text-red-600 hover:text-red-700 p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">
        <p>No hay participantes agregados aún.</p>
        <p class="text-sm">Agrega al menos uno para continuar.</p>
      </div>
    </div>

    <!-- Current user selection -->
    <div v-if="users.length > 0" class="card">
      <h3 class="text-lg font-semibold mb-4">¿Quién eres tú?</h3>
      <p class="text-sm text-gray-600 mb-4">Selecciona tu nombre para que la app te reconozca automáticamente.</p>
      
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

    <!-- Start button -->
    <div v-if="users.length > 0 && currentUserId" class="text-center">
      <button
        @click="startApp"
        class="btn-primary text-lg px-8 py-3"
      >
        ¡Empezar a usar la app!
      </button>
    </div>

    <!-- Tips -->
    <div class="card bg-blue-50 border-blue-200">
      <h4 class="font-semibold text-blue-900 mb-2">💡 Consejos:</h4>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Puedes agregar hasta 6 participantes</li>
        <li>• Los datos se guardan en tu dispositivo</li>
        <li>• Usa la función de exportar para hacer respaldos</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { getCurrentUser } from '../config/supabase.js'

export default {
  name: 'Onboarding',
  setup() {
    const router = useRouter()
    const users = ref([])
    const newUserName = ref('')
    const newUserColor = ref('#3b82f6')
    const currentUserId = ref('')

    onMounted(async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        const userList = await storage.getUsers()
        users.value = userList
        currentUserId.value = localStorage.getItem('currentUserId') || ''
      } catch (error) {
        console.error('Error loading users:', error)
        router.push('/auth')
      }
    })

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

    const removeUser = async (userId) => {
      if (confirm('¿Estás seguro de que quieres eliminar este participante?')) {
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

    const startApp = () => {
      if (currentUserId.value) {
        localStorage.setItem('currentUserId', currentUserId.value)
      }
      router.push('/')
    }

    return {
      users,
      newUserName,
      newUserColor,
      currentUserId,
      addUser,
      removeUser,
      startApp
    }
  }
}
</script>
