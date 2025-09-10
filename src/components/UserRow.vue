<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <!-- User info -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          :style="{ backgroundColor: user.color }"
        >
          {{ getUserInitial(user) }}
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">{{ getUserName(user) }}</h3>
          <p class="text-sm text-gray-600">Total: {{ total }} puntos</p>
        </div>
      </div>

      <!-- Points controls -->
      <div class="flex items-center gap-2">
        <!-- Present button -->
        <button
          @click="togglePresent"
          :disabled="readonly"
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          :class="readonly ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : (isPresent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')"
        >
          {{ isPresent ? 'Presente' : 'Marcar' }}
        </button>

        <!-- Points input -->
        <div class="flex items-center gap-1">
          <button
            @click="decreasePoints"
            :disabled="readonly"
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="readonly ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          
          <input
            v-model.number="localPoints"
            type="number"
            min="0"
            :disabled="readonly"
            class="w-12 h-8 text-center border rounded-lg focus:outline-none"
            :class="readonly ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
            @change="updatePoints"
            @blur="updatePoints"
          />
          
          <button
            @click="increasePoints"
            :disabled="readonly"
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="readonly ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { storage } from '../services/storage.js'

export default {
  name: 'UserRow',
  props: {
    user: {
      type: Object,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['points-updated'],
  setup(props, { emit }) {
    // Helper functions for safe user data access - MUST BE FIRST
    const getUserName = (user) => {
      return user?.display_name || user?.name || 'Usuario Sin Nombre'
    }

    const getUserInitial = (user) => {
      const name = getUserName(user)
      return name.charAt(0).toUpperCase()
    }

    const getUserId = (user) => {
      return user?.user_id || user?.id
    }

    const localPoints = ref(0)

    // Load current points for this user and date
    const loadPoints = async () => {
      try {
        localPoints.value = await storage.getUserPoints(props.date, getUserId(props.user))
      } catch (error) {
        console.error('Error loading points:', error)
      }
    }

    // Computed properties
    const total = ref(0)
    const isPresent = computed(() => localPoints.value > 0)

    // Load total points
    const loadTotal = async () => {
      try {
        total.value = await storage.getUserTotal(getUserId(props.user))
      } catch (error) {
        console.error('Error loading total:', error)
      }
    }

    // Watch for date changes
    watch(() => props.date, loadPoints, { immediate: true })
    watch(() => getUserId(props.user), loadTotal, { immediate: true })

    // Methods
    const updatePoints = async () => {
      try {
        const points = Math.max(0, localPoints.value || 0)
        await storage.setUserPoints(props.date, getUserId(props.user), points)
        await loadTotal() // Refresh total
        emit('points-updated')
      } catch (error) {
        alert('Error al actualizar puntos: ' + error.message)
      }
    }

    const increasePoints = () => {
      localPoints.value = (localPoints.value || 0) + 1
      updatePoints()
    }

    const decreasePoints = () => {
      localPoints.value = Math.max(0, (localPoints.value || 0) - 1)
      updatePoints()
    }

    const togglePresent = () => {
      if (isPresent.value) {
        localPoints.value = 0
      } else {
        localPoints.value = 1
      }
      updatePoints()
    }



    return {
      localPoints,
      total,
      isPresent,
      updatePoints,
      increasePoints,
      decreasePoints,
      togglePresent,
      getUserName,
      getUserInitial,
      getUserId
    }
  }
}
</script>
