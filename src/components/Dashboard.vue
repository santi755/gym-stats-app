<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">📊 Dashboard</h2>
      <p class="text-gray-600">Estadísticas avanzadas y gráficos</p>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 gap-4">
      <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 font-medium">Días Activos</p>
            <p class="text-2xl font-bold text-blue-900">{{ totalActiveDays }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 font-medium">Promedio/Día</p>
            <p class="text-2xl font-bold text-green-900">{{ averagePointsPerDay }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Progress Chart -->
    <div class="card">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Progreso Semanal
      </h3>
      <div class="h-64">
        <canvas ref="weeklyChart"></canvas>
      </div>
    </div>

    <!-- Monthly Comparison -->
    <div class="card">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Comparación Mensual
      </h3>
      <div class="h-64">
        <canvas ref="monthlyChart"></canvas>
      </div>
    </div>

    <!-- User Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Streaks -->
      <div class="card">
        <h3 class="font-semibold mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          Racha Actual
        </h3>
        <div class="space-y-3">
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
                {{ (user.display_name || user.name).charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium">{{ user.display_name || user.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-orange-600">-</span>
              <span class="text-sm text-gray-600">días</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Best Weeks -->
      <div class="card">
        <h3 class="font-semibold mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Mejor Semana
        </h3>
        <div class="space-y-3">
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
                {{ (user.display_name || user.name).charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium">{{ user.display_name || user.name }}</span>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-yellow-600">-</div>
              <div class="text-xs text-gray-600">puntos</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Ranking Chart -->
    <div class="card">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Ranking Semanal
      </h3>
      <div class="h-64">
        <canvas ref="rankingChart"></canvas>
      </div>
    </div>

    <!-- Fun Stats -->
    <div class="card bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <h3 class="font-semibold mb-4 text-pink-900">🏆 Estadísticas Divertidas</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="text-center p-3 bg-white rounded-lg">
          <div class="text-2xl font-bold text-pink-600">{{ mostActiveUser.display_name || mostActiveUser.name }}</div>
          <div class="text-gray-600">Más activo</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ totalPointsAllUsers }}</div>
          <div class="text-gray-600">Puntos totales</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ longestStreak }}</div>
          <div class="text-gray-600">Racha más larga</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ bestWeekPoints }}</div>
          <div class="text-gray-600">Mejor semana</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { storage } from '../services/storage.js'
import { useUserStore } from '@/stores/UserStore.js'

Chart.register(...registerables)

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const users = ref([])
    const weeklyChart = ref(null)
    const monthlyChart = ref(null)
    const rankingChart = ref(null)
    
    const totalActiveDays = ref(0)
    const averagePointsPerDay = ref(0)

    // Computed properties for fun stats
    const mostActiveUser = ref({ name: 'N/A' })
    const totalPointsAllUsers = ref(0)
    const longestStreak = ref(0)
    const bestWeekPoints = ref(0)

    const loadFunStats = async () => {
      try {
        if (users.value.length === 0) return
        
        const totals = await storage.getAllTotals()
        const mostActive = users.value.reduce((max, user) => 
          (totals[user.user_id || user.id] || 0) > (totals[max.user_id || max.id] || 0) ? user : max
        )
        mostActiveUser.value = mostActive
        
        totalPointsAllUsers.value = Object.values(totals).reduce((sum, points) => sum + points, 0)
        
        // Simplified stats to avoid potential errors
        longestStreak.value = Math.max(...Object.values(totals))
        bestWeekPoints.value = Math.max(...Object.values(totals))
      } catch (error) {
        console.error('Error loading fun stats:', error)
        // Set default values on error
        mostActiveUser.value = { name: 'N/A', display_name: 'N/A' }
        totalPointsAllUsers.value = 0
        longestStreak.value = 0
        bestWeekPoints.value = 0
      }
    }

    const loadUsers = async () => {
      try {
        users.value = await storage.getUsers()
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const createWeeklyChart = async () => {
      console.log('Weekly chart disabled - RLS issues')
      return
      
      const ctx = weeklyChart.value.getContext('2d')
      const weeklyStats = await storage.getWeeklyStats(4)
      
      const datasets = users.value.map(user => ({
        label: user.display_name || user.name,
        data: weeklyStats.map(week => week.users[user.user_id || user.id]?.points || 0),
        borderColor: user.color,
        backgroundColor: user.color + '20',
        tension: 0.4,
        fill: false
      }))

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: weeklyStats.map(week => week.label),
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6'
              }
            },
            x: {
              grid: {
                color: '#f3f4f6'
              }
            }
          }
        }
      })
    }

    const createMonthlyChart = async () => {
      console.log('Monthly chart disabled - RLS issues')
      return
      
      const ctx = monthlyChart.value.getContext('2d')
      const monthlyStats = await storage.getMonthlyStats(6)
      
      const datasets = users.value.map(user => ({
        label: user.display_name || user.name,
        data: monthlyStats.map(month => month.users[user.user_id || user.id]?.points || 0),
        backgroundColor: user.color + '80',
        borderColor: user.color,
        borderWidth: 2
      }))

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyStats.map(month => month.label),
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6'
              }
            },
            x: {
              grid: {
                color: '#f3f4f6'
              }
            }
          }
        }
      })
    }

    const createRankingChart = async () => {
      console.log('Ranking chart disabled - RLS issues')
      return
      
      const ctx = rankingChart.value.getContext('2d')
      const weeklyStats = await storage.getWeeklyStats(4)
      const currentWeek = weeklyStats[weeklyStats.length - 1]
      
      const sortedUsers = users.value
        .map(user => ({
          name: user.display_name || user.name,
          color: user.color,
          points: currentWeek.users[user.user_id || user.id]?.points || 0
        }))
        .sort((a, b) => b.points - a.points)

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: sortedUsers.map(user => user.name),
          datasets: [{
            data: sortedUsers.map(user => user.points),
            backgroundColor: sortedUsers.map(user => user.color + '80'),
            borderColor: sortedUsers.map(user => user.color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            }
          }
        }
      })
    }

    onMounted(async () => {
      try {
        const user = userStore.getUser
        if (!user) {
          router.push('/auth')
          return
        }
        
        await loadUsers()
        
        // DISABLED: These functions cause infinite 406 loops due to RLS issues
        console.log('Dashboard stats disabled due to RLS policy issues')
        
        // Set default values to prevent errors
        totalActiveDays.value = 0
        averagePointsPerDay.value = 0
        mostActiveUser.value = { display_name: 'N/A', name: 'N/A' }
        totalPointsAllUsers.value = 0
        longestStreak.value = 0
        bestWeekPoints.value = 0
        
        // Create charts after a short delay to ensure DOM is ready
        setTimeout(async () => {
          await createWeeklyChart()
          await createMonthlyChart()
          await createRankingChart()
        }, 100)
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        router.push('/auth')
      }
    })

    return {
      users,
      weeklyChart,
      monthlyChart,
      rankingChart,
      totalActiveDays,
      averagePointsPerDay,
      mostActiveUser,
      totalPointsAllUsers,
      longestStreak,
      bestWeekPoints
    }
  }
}
</script>
