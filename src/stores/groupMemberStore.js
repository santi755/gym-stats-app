import { defineStore } from 'pinia'
import { getGroupMembers } from '@/config/groupMemberHttpService.js'

export const useGroupMemberStore = defineStore('groupMember', {
  state: () => ({
    members: [],
  }),

  actions: {
    async getGroupMembers(groupId) {
      const members = await getGroupMembers(groupId)
      this.members = members
    },

    getMemberByUserId(userId) {
      return this.members.find((member) => member.user_id === userId)
    },
  },
})
