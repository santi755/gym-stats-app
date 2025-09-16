import { defineStore } from 'pinia'
import { getGroupMembers } from '@/config/groupMemberHttpService.js'

export const useGroupMemberStore = defineStore('groupMember', {
  state: () => ({
    members: [],
  }),

  actions: {
    async getGroupMembers(groupId) {
      console.log('0) getGroupMembers', groupId)
      const members = await getGroupMembers(groupId)
      this.members = members
    },
  },
})
