<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Historial</h2>
      <p class="text-gray-600">Revisa el historial de puntos por fecha</p>
    </div>

    <!-- Date selector -->
    <div class="card">
      <h3 class="font-semibold mb-3">Seleccionar Fecha</h3>
      <div class="flex gap-2">
        <input
          v-model="selectedDate"
          type="date"
          class="input-field flex-1"
          @change="loadDateEntries"
        />
        <button
          @click="goToToday"
          class="btn-secondary"
        >
          Hoy
        </button>
      </div>
    </div>

    <!-- Date entries -->
    <div v-if="selectedDateEntries" class="space-y-3">
      <div class="card">
        <h3 class="font-semibold mb-3">
          {{ formattedSelectedDate }}
        </h3>
        
        <div v-if="Object.keys(selectedDateEntries).length === 0" class="text-center py-4 text-gray-500">
          <p>No hay datos para esta fecha.</p>
        </div>
        
        <div v-else class="space-y-2">
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
            <div class="flex items-center gap-2">
              <input
                v-model.number="editingPoints[user.id]"
                type="number"
                min="0"
                class="w-16 h-8 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="updateUserPoints(user.id)"
              />
              <span class="text-sm text-gray-600">puntos</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="card">
      <h3 class="font-semibold mb-3">Ranking General</h3>
      <div class="space-y-2">
        <div
          v-for="(user, index) in leaderboard"
          :key="user.id"
          class="flex items-center justify-between p-3 rounded-lg"
          :class="index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'"
        >
          <div class="flex items-center gap-3">
            <span 
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              :class="index < 3 ? 'bg-yellow-500' : 'bg-gray-400'"
            >
              {{ index + 1 }}
            </span>
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              :style="{ backgroundColor: user.color }"
            >
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="font-medium">{{ user.name }}</span>
              <p class="text-sm text-gray-600">{{ user.total }} puntos totales</p>
            </div>
          </div>
          <div v-if="index < 3" class="text-yellow-600">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="card">
      <h3 class="font-semibold mb-3">Estadísticas</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Días registrados:</span>
          <span class="font-semibold ml-1">{{ allDates.length }}</span>
        </div>
        <div>
          <span class="text-gray-600">Total puntos:</span>
          <span class="font-semibold ml-1">{{ totalAllPoints }}</span>
        </div>
        <div>
          <span class="text-gray-600">Promedio por día:</span>
          <span class="font-semibold ml-1">{{ averagePerDay }}</span>
        </div>
        <div>
          <span class="text-gray-600">Participantes:</span>
          <span class="font-semibold ml-1">{{ users.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { useUserStore } from '@/stores/UserStore.js'

export default {
  name: 'History',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const users = ref([])
    const selectedDate = ref('')
    const selectedDateEntries = ref({})
    const editingPoints = ref({})
    const leaderboard = ref([])
    const allDates = ref([])

    // Computed properties
    const formattedSelectedDate = computed(() => {
      if (!selectedDate.value) return ''
      const date = new Date(selectedDate.value)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const totalAllPoints = computed(() => {
      return leaderboard.value.reduce((sum, user) => sum + user.total, 0)
    })

    const averagePerDay = computed(() => {
      if (allDates.value.length === 0) return 0
      return Math.round(totalAllPoints.value / allDates.value.length)
    })

    // Methods
    const loadUsers = async () => {
      try {
        users.value = await storage.getUsers()
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const loadDateEntries = async () => {
      if (!selectedDate.value) return
      
      try {
        selectedDateEntries.value = await storage.getDateEntries(selectedDate.value)
        
        // Initialize editing points
        editingPoints.value = {}
        users.value.forEach(user => {
          editingPoints.value[user.id] = selectedDateEntries.value[user.id] || 0
        })
      } catch (error) {
        console.error('Error loading date entries:', error)
      }
    }

    const updateUserPoints = async (userId) => {
      try {
        const points = Math.max(0, editingPoints.value[userId] || 0)
        await storage.setUserPoints(selectedDate.value, userId, points)
        selectedDateEntries.value[userId] = points
      } catch (error) {
        alert('Error al actualizar puntos: ' + error.message)
      }
    }

    const goToToday = () => {
      selectedDate.value = storage.getTodayKey()
      loadDateEntries()
    }

    const loadLeaderboard = async () => {
      try {
        leaderboard.value = await storage.getLeaderboard()
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      }
    }

    const loadAllDates = async () => {
      try {
        const entries = await storage.getAllEntries()
        allDates.value = Object.keys(entries).sort((a, b) => b.localeCompare(a))
      } catch (error) {
        console.error('Error loading all dates:', error)
      }
    }

    // Lifecycle
    onMounted(async () => {
      try {
        const user = userStore.getUser
        if (!user) {
          router.push('/auth')
          return
        }
        
        await loadUsers()
        await loadLeaderboard()
        await loadAllDates()
        selectedDate.value = storage.getTodayKey()
        await loadDateEntries()
      } catch (error) {
        console.error('Error initializing history:', error)
        router.push('/auth')
      }
    })

    return {
      users,
      selectedDate,
      selectedDateEntries,
      editingPoints,
      leaderboard,
      allDates,
      formattedSelectedDate,
      totalAllPoints,
      averagePerDay,
      loadDateEntries,
      updateUserPoints,
      goToToday
    }
  }
}
</script>
