import { defineStore } from 'pinia'
import { getCurrentGroup } from '@/config/groupHttpService.js'
import { getCurrentUser, signIn, signUp, signOut } from '@/config/authHttpService.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    group: null,
  }),

  actions: {
    async signInUser(email, password) {
      const result = await signIn(email, password)

      this.user = result.data.user
      return result
    },

    async signUpUser(email, password) {
      const result = await signUp(email, password)

      return result
    },

    async signOutUser() {
      const result = await signOut()
      this.user = null
      return result
    },

    async fetchUser() {
      const user = await getCurrentUser()
      this.user = user
    },

    async fetchGroup() {
      const groupId = this.user.current_group_id
      const group = await getCurrentGroup(groupId)
      this.group = group
    },
  },

  getters: {
    getUser: (state) => state.user,
    getGroup: (state) => state.group,
  },
})
