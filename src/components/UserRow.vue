<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <!-- User info -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          :style="{ backgroundColor: user.color }"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">{{ user.name }}</h3>
          <p class="text-sm text-gray-600">Total: {{ total }} puntos</p>
        </div>
      </div>

      <!-- Points controls -->
      <div class="flex items-center gap-2">
        <!-- Present button -->
        <button
          @click="togglePresent"
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          :class="isPresent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ isPresent ? 'Presente' : 'Marcar' }}
        </button>

        <!-- Points input -->
        <div class="flex items-center gap-1">
          <button
            @click="decreasePoints"
            class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          
          <input
            v-model.number="localPoints"
            type="number"
            min="0"
            class="w-12 h-8 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="updatePoints"
            @blur="updatePoints"
          />
          
          <button
            @click="increasePoints"
            class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
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
    }
  },
  emits: ['points-updated'],
  setup(props, { emit }) {
    const localPoints = ref(0)

    // Load current points for this user and date
    const loadPoints = async () => {
      try {
        localPoints.value = await storage.getUserPoints(props.date, props.user.id)
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
        total.value = await storage.getUserTotal(props.user.id)
      } catch (error) {
        console.error('Error loading total:', error)
      }
    }

    // Watch for date changes
    watch(() => props.date, loadPoints, { immediate: true })
    watch(() => props.user.id, loadTotal, { immediate: true })

    // Methods
    const updatePoints = async () => {
      try {
        const points = Math.max(0, localPoints.value || 0)
        await storage.setUserPoints(props.date, props.user.id, points)
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
      togglePresent
    }
  }
}
</script>
