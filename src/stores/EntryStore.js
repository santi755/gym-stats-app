import { defineStore } from 'pinia'
import { createEntry, deleteEntry } from '@/config/entriesHttpService'

export const useEntryStore = defineStore('entry', {
  state: () => ({
    entries: [],
  }),

  actions: {
    async createEntry(groupId, memberId, date, points = 0) {
      const { data, error } = await createEntry(groupId, memberId, date, points)
      if (error) {
        console.error('Error creating entry:', error)
      }
      this.entries.push(data)
    },

    async deleteEntry(groupId, memberId, date) {
      const { data, error } = await deleteEntry(groupId, memberId, date)
      if (error) {
        console.error('Error deleting entry:', error)
      }
      this.entries = this.entries.filter((entry) => entry.id !== data.id)
    },
  },
})
