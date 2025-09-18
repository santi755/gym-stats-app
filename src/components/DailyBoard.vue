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
          :disabled="currentUserHasEnteredToday"
        >
          {{ currentUserHasEnteredToday ? '¡Ya registrado!' : '¡Fui al gym!' }}
        </button>
        <button
          @click="clearMyPoints"
          class="flex-1 btn-secondary"
          :disabled="!currentUserHasEnteredToday"
        >
          Deshacer
        </button>
      </div>
      <p class="text-xs text-gray-600 mt-2 text-center">Solo puedes editar tus propios puntos</p>
    </div>

    <!-- Users list -->
    <div class="space-y-3">
      <UserRow
        v-for="user in groupMemberStore.members"
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
            <span
              class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center"
            >
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '../services/storage.js'
import { useUserStore } from '@/stores/UserStore.js'
import { useUserPreferences } from '@/stores/useUserPreferences.js'
import UserRow from './UserRow.vue'
import { useGroupMemberStore } from '@/stores/groupMemberStore.js'
import { useEntryStore } from '@/stores/EntryStore.js'

const router = useRouter()
const userStore = useUserStore()
const userPreferences = useUserPreferences()
const groupMemberStore = useGroupMemberStore()
const entryStore = useEntryStore()
const users = ref([])
const today = ref('')
const leaderboard = ref([])
const currentUserId = ref('')

// Computed properties
const formattedDate = computed(() => {
  const date = new Date(today.value)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const loadUsers = async () => {
  try {
    // Get user preferences
    await userPreferences.getUserPreferences(userStore.user)

    const groupId = userPreferences.preferences.current_group_id
    await groupMemberStore.getGroupMembers(groupId)
    users.value = groupMemberStore.members
  } catch (error) {
    console.error('Error loading users:', error)
  }
}
/*
const loadTodayStats = async () => {
  try {
    const entries = await storage.getDateEntries(today.value)
    presentCount.value = Object.values(entries).filter((points) => points > 0).length
    todayTotal.value = Object.values(entries).reduce((sum, points) => sum + points, 0)
  } catch (error) {
    console.error('Error loading today stats:', error)
  }
}

// Methods

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
*/

const markMyself = async () => {
  try {
    const groupId = userPreferences.preferences.current_group_id
    const currentMember = groupMemberStore.getMemberByUserId(currentUserId.value)
    await entryStore.createEntry(groupId, currentMember.id, today.value, 1)
    await refreshData()
  } catch (error) {
    alert('Error al registrar entrenamiento: ' + error.message)
  }
}

const clearMyPoints = async () => {
  if (confirm('¿Deshacer tu registro de hoy?')) {
    try {
      const groupId = userPreferences.preferences.current_group_id
      const currentMember = groupMemberStore.getMemberByUserId(currentUserId.value)

      await entryStore.deleteEntry(groupId, currentMember.id, today.value)
      await refreshData()
    } catch (error) {
      alert('Error al deshacer registro: ' + error.message)
    }
  }
}

const refreshData = async () => {
  await loadUsers()
}

const currentUserHasEnteredToday = computed(() => {
  const currentMember = groupMemberStore.getMemberByUserId(currentUserId.value)
  return currentMember?.has_entered_today
})

const presentCount = computed(() => {
  return groupMemberStore.members.filter((member) => member.has_entered_today).length
})

// Lifecycle
onMounted(async () => {
  try {
    currentUserId.value = userStore.user.id
    today.value = storage.getTodayKey()
    await refreshData()
    /*
    await loadLeaderboard()
    await loadMyPoints()
    await loadTodayStats()
    */
  } catch (error) {
    console.error('Error initializing:', error)
    router.push('/auth')
  }
})
</script>
