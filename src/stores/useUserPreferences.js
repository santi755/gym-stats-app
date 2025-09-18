import { defineStore } from 'pinia'
import { getUserPreferences } from '@/config/userPreferencesHttpService.js'

export const useUserPreferences = defineStore('userPreferences', {
  state: () => ({
    preferences: null,
  }),

  actions: {
    async getUserPreferences(user) {
      if (this.preferences) return this.preferences

      const preferences = await getUserPreferences(user)
      this.preferences = preferences
    },
  },
})
