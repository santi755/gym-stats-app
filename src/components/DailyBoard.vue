<template>
  <div class="space-y-6">
    <!-- Header with date -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Puntos de Hoy</h2>
      <p class="text-lg text-gray-600">{{ formattedDate }}</p>
    </div>

    <!-- Quick actions -->
    <div class="card">
      <h3 class="font-semibold mb-3">Mi Entrenamiento de Hoy</h3>
      <div class="flex gap-2">
        <button
          @click="markMyself"
          class="flex-1 btn-primary"
          :disabled="myPointsToday > 0"
        >
          {{ myPointsToday > 0 ? '¡Ya registrado!' : '¡Fui al gym!' }}
        </button>
        <button
          @click="clearMyPoints"
          class="flex-1 btn-secondary"
          :disabled="myPointsToday === 0"
        >
          Deshacer
        </button>
      </div>
      <p class="text-xs text-gray-600 mt-2 text-center">
        Solo puedes editar tus propios puntos
      </p>
    </div>

    <!-- Users list -->
    <div class="space-y-3">
      <UserRow
        v-for="user in users"
        :key="user.user_id || user.id"
        :user="user"
        :date="today"
        :readonly="user.user_id !== currentUserId && user.id !== currentUserId"
        @points-updated="refreshData"
      />
    </div>

    <!-- Summary -->
    <div class="card bg-blue-50 border-blue-200">
      <h3 class="font-semibold text-blue-900 mb-2">Resumen del Día</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-blue-700">Presentes:</span>
          <span class="font-semibold text-blue-900 ml-1">{{ presentCount }}</span>
        </div>
        <div>
          <span class="text-blue-700">Total puntos:</span>
          <span class="font-semibold text-blue-900 ml-1">{{ todayTotal }}</span>
        </div>
      </div>
    </div>

    <!-- Leaderboard preview -->
    <div class="card">
      <h3 class="font-semibold mb-3">Ranking General</h3>
      <div class="space-y-2">
        <div
          v-for="(user, index) in leaderboard.slice(0, 3)"
          :key="user.id"
          class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
              {{ index + 1 }}
            </span>
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              :style="{ backgroundColor: user.color }"
            >
              {{ (user.display_name || user.name).charAt(0).toUpperCase() }}
            </div>
            <span class="font-medium">{{ user.display_name || user.name }}</span>
          </div>
          <span class="font-semibold text-gray-900">{{ user.total }} pts</span>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <router-link
          to="/history"
          class="flex-1 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Ver ranking completo →
        </router-link>
        <router-link
          to="/dashboard"
          class="flex-1 text-center text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          📊 Dashboard →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { useUserStore } from '@/stores/UserStore.js'
import UserRow from './UserRow.vue'

export default {
  name: 'DailyBoard',
  components: {
    UserRow
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const users = ref([])
    const today = ref('')
    const leaderboard = ref([])
    const currentUserId = ref('')
    const myPointsToday = ref(0)

    // Computed properties
    const formattedDate = computed(() => {
      const date = new Date(today.value)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const presentCount = ref(0)
    const todayTotal = ref(0)

    const loadTodayStats = async () => {
      try {
        const entries = await storage.getDateEntries(today.value)
        presentCount.value = Object.values(entries).filter(points => points > 0).length
        todayTotal.value = Object.values(entries).reduce((sum, points) => sum + points, 0)
      } catch (error) {
        console.error('Error loading today stats:', error)
      }
    }

    // Methods
    const loadUsers = async () => {
      try {
        const userList = await storage.getUsers()
        users.value = userList
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const loadLeaderboard = async () => {
      try {
        leaderboard.value = await storage.getLeaderboard()
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      }
    }

    const refreshData = async () => {
      await loadLeaderboard()
      await loadMyPoints()
      await loadTodayStats()
    }

    const loadMyPoints = async () => {
      try {
        myPointsToday.value = await storage.getUserPoints(today.value, currentUserId.value)
      } catch (error) {
        console.error('Error loading my points:', error)
      }
    }

    const markMyself = async () => {
      try {
        await storage.setUserPoints(today.value, currentUserId.value, 1)
        await refreshData()
      } catch (error) {
        alert('Error al registrar entrenamiento: ' + error.message)
      }
    }

    const clearMyPoints = async () => {
      if (confirm('¿Deshacer tu registro de hoy?')) {
        try {
          await storage.setUserPoints(today.value, currentUserId.value, 0)
          await refreshData()
        } catch (error) {
          alert('Error al deshacer registro: ' + error.message)
        }
      }
    }

    // Lifecycle
    onMounted(async () => {
      try {
        // Get current user
        const user = userStore.getUser
        if (!user) {
          router.push('/auth')
          return
        }
        currentUserId.value = userStore.getUser.id
        
        today.value = storage.getTodayKey()
        await loadUsers()
        await loadLeaderboard()
        await loadMyPoints()
        await loadTodayStats()
      } catch (error) {
        console.error('Error initializing:', error)
        router.push('/auth')
      }
    })

    return {
      users,
      today,
      leaderboard,
      currentUserId,
      myPointsToday,
      formattedDate,
      presentCount,
      todayTotal,
      refreshData,
      markMyself,
      clearMyPoints,
      loadTodayStats
    }
  }
}
</script>
