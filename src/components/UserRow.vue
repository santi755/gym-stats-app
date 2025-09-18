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
          <p class="text-sm text-gray-600">Total: {{ user?.total_points || 0 }} puntos</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <p class="text-sm text-gray-600">
          {{ user?.has_entered_today ? 'Ha entrado hoy' : 'No ha entrado hoy' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const getUserName = (user) => {
  return user?.display_name || user?.name || 'Usuario Sin Nombre'
}

const getUserInitial = (user) => {
  const name = getUserName(user)
  return name.charAt(0).toUpperCase()
}
</script>
