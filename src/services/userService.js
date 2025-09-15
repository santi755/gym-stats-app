import { 
    supabase, 
    TABLES, 
    getUserPreferences, 
    updateUserPreferences, 
    createUserPreferences,
    getGroupMembers,
    getCurrentMember,
    createEntry,
    getGroupEntries
  } from '../config/httpConfig.js'
  import { useUserStore } from '../stores/UserStore.js'
  
  // Modern storage service using group members system
  export class StorageService {
    constructor() {
      this.isOnline = navigator.onLine
      this.setupOnlineListener()
      this._preferencesCache = null
    }
  
    setupOnlineListener() {
      window.addEventListener('online', () => {
        this.isOnline = true
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  
    // Check if user is authenticated
    async isAuthenticated() {
      const user = useUserStore().getUser
      return !!user
    }
  
    // Get user preferences with caching
    async getUserPreferences() {
      if (!this._preferencesCache) {
        try {
          this._preferencesCache = await getUserPreferences()
        } catch (error) {
          console.error('Error getting user preferences:', error)
          // Create default preferences if they don't exist
          this._preferencesCache = await createUserPreferences()
        }
      }
      return this._preferencesCache
    }
  
    // Update preferences and clear cache
    async updatePreferences(updates) {
      const updated = await updateUserPreferences(updates)
      this._preferencesCache = updated
      return updated
    }
  
    // Clear preferences cache
    clearPreferencesCache() {
      this._preferencesCache = null
    }
  
    // Group management
    async createGroup(name, description = '') {
      const { createGroup } = await import('../config/httpConfig.js')
      return await createGroup(name, description)
    }
  
    async getGroups() {
      const { getUserGroups } = await import('../config/httpConfig.js')
      return await getUserGroups()
    }
  
    async setCurrentGroup(groupId) {
      await this.updatePreferences({ current_group_id: groupId })
    }
  
    async getCurrentGroup() {
      const preferences = await this.getUserPreferences()
      return preferences.current_group_id
    }
  
    // Ensure user has a group (create default if needed)
    async ensureUserHasGroup() {
      const preferences = await this.getUserPreferences()
      
      if (!preferences.current_group_id) {
        // Check if user has any groups
        const groups = await this.getGroups()
        
        if (groups.length === 0) {
          // Create a default group
          const defaultGroup = await this.createGroup('Mi Grupo de Gym', 'Grupo creado automáticamente')
          return defaultGroup.id
        } else {
          // Set the first group as current
          await this.updatePreferences({ current_group_id: groups[0].id })
          return groups[0].id
        }
      }
      
      return preferences.current_group_id
    }
  
    // Member management (replaces old user management)
    async getUsers() {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return []
  
      return await getGroupMembers(groupId)
    }
  
    async addUser(name, color = '#3b82f6', avatar = null) {
      // This is now deprecated - users join via invitations
      // Keeping for backward compatibility
      throw new Error('Para agregar miembros, usa el sistema de invitaciones')
    }
  
    async updateUser(userId, updates) {
      // Find member by user_id and update
      const groupId = await this.getCurrentGroup()
      if (!groupId) throw new Error('No hay grupo seleccionado')
  
      const members = await getGroupMembers(groupId)
      const member = members.find(m => m.user_id === userId)
      
      if (!member) throw new Error('Miembro no encontrado')
  
      const { updateGroupMember } = await import('../config/httpConfig.js')
      return await updateGroupMember(member.id, updates)
    }
  
    async deleteUser(userId) {
      // Only allow if user is deleting themselves (leaving group)
      const user = useUserStore().getUser
      if (user.id !== userId) {
        throw new Error('Solo puedes eliminar tu propia membresía')
      }
  
      const groupId = await this.getCurrentGroup()
      if (!groupId) throw new Error('No hay grupo seleccionado')
  
      const { leaveGroup } = await import('../config/httpConfig.js')
      return await leaveGroup(groupId)
    }
  
    // Get current user's member record
    async getCurrentMemberRecord() {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return null
  
      return await getCurrentMember(groupId)
    }
  
    // Entry management (updated for new member system)
    async setUserPoints(date, userId, points) {
      const groupId = await this.getCurrentGroup()
      if (!groupId) throw new Error('No hay grupo seleccionado')
  
      // Get current user's member record
      const currentMember = await this.getCurrentMemberRecord()
      if (!currentMember) throw new Error('No eres miembro de este grupo')
  
      // Only allow users to set their own points
      const user = useUserStore().getUser
      if (user.id !== userId) {
        throw new Error('Solo puedes editar tus propios puntos')
      }
  
      return await createEntry(groupId, currentMember.id, date, points)
    }
  
    async getUserPoints(date, userId) {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return 0
  
      // Find member record for this user
      const members = await getGroupMembers(groupId)
      const member = members.find(m => m.user_id === userId)
      if (!member) return 0
  
      const { data, error } = await supabase
        .from(TABLES.ENTRIES)
        .select('points')
        .eq('group_id', groupId)
        .eq('member_id', member.id)
        .eq('date', date)
        .single()
  
      if (error && error.code !== 'PGRST116') throw error
      return data?.points || 0
    }
  
    async getDateEntries(date) {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return {}
  
      const members = await getGroupMembers(groupId)
      const entries = {}
  
      for (const member of members) {
        const points = await this.getUserPoints(date, member.user_id)
        if (points > 0) {
          entries[member.user_id] = points
        }
      }
  
      return entries
    }
  
    async getAllEntries() {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return {}
  
      const entries = await getGroupEntries(groupId, '2020-01-01', '2030-12-31')
      const result = {}
  
      entries.forEach(entry => {
        if (!result[entry.date]) {
          result[entry.date] = {}
        }
        result[entry.date][entry.group_members.user_id] = entry.points
      })
  
      return result
    }
  
    // Statistics
    async getUserTotal(userId) {
      const groupId = await this.getCurrentGroup()
      if (!groupId) return 0
  
      // Find member record for this user
      const members = await getGroupMembers(groupId)
      const member = members.find(m => m.user_id === userId)
      if (!member) return 0
  
      const { data, error } = await supabase
        .from(TABLES.ENTRIES)
        .select('points')
        .eq('group_id', groupId)
        .eq('member_id', member.id)
  
      if (error) throw error
      
      return data.reduce((total, entry) => total + entry.points, 0)
    }
  
    async getAllTotals() {
      const users = await this.getUsers()
      const totals = {}
      
      for (const user of users) {
        totals[user.user_id] = await this.getUserTotal(user.user_id)
      }
      
      return totals
    }
  
    async getLeaderboard() {
      const users = await this.getUsers()
      const totals = await this.getAllTotals()
      
      return users
        .map(user => ({
          id: user.user_id,
          name: user.display_name,
          color: user.color,
          avatar: user.avatar,
          total: totals[user.user_id] || 0,
          role: user.role
        }))
        .sort((a, b) => b.total - a.total)
    }
  
    // Weekly statistics
    async getWeeklyStats(weeksBack = 4) {
      const users = await this.getUsers()
      const today = new Date()
      const weeks = []
      
      for (let i = 0; i < weeksBack; i++) {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)))
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        
        const weekData = {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          label: `Semana ${weeksBack - i}`,
          users: {}
        }
        
        // Calculate points for each user in this week
        for (const user of users) {
          let weekPoints = 0
          for (let d = 0; d < 7; d++) {
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + d)
            const dateKey = date.toISOString().split('T')[0]
            weekPoints += await this.getUserPoints(dateKey, user.user_id)
          }
          weekData.users[user.user_id] = {
            name: user.display_name,
            color: user.color,
            points: weekPoints
          }
        }
        
        weeks.push(weekData)
      }
      
      return weeks.reverse()
    }
  
    // Monthly statistics
    async getMonthlyStats(monthsBack = 6) {
      const users = await this.getUsers()
      const today = new Date()
      const months = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
        
        const monthData = {
          monthStart: monthStart.toISOString().split('T')[0],
          monthEnd: monthEnd.toISOString().split('T')[0],
          label: monthStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          users: {}
        }
        
        // Calculate points for each user in this month
        for (const user of users) {
          let monthPoints = 0
          const currentDate = new Date(monthStart)
          
          while (currentDate <= monthEnd) {
            const dateKey = currentDate.toISOString().split('T')[0]
            monthPoints += await this.getUserPoints(dateKey, user.user_id)
            currentDate.setDate(currentDate.getDate() + 1)
          }
          
          monthData.users[user.user_id] = {
            name: user.display_name,
            color: user.color,
            points: monthPoints
          }
        }
        
        months.push(monthData)
      }
      
      return months.reverse()
    }
  
    // User streak
    async getUserStreak(userId) {
      const today = new Date()
      let streak = 0
      let currentDate = new Date(today)
      
      // Check backwards from today
      while (true) {
        const dateKey = currentDate.toISOString().split('T')[0]
        const points = await this.getUserPoints(dateKey, userId)
        
        if (points > 0) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
      
      return streak
    }
  
    // Best week for user
    async getUserBestWeek(userId) {
      const weeklyStats = await this.getWeeklyStats(12)
      let bestWeek = null
      let maxPoints = 0
      
      weeklyStats.forEach(week => {
        const userPoints = week.users[userId]?.points || 0
        if (userPoints > maxPoints) {
          maxPoints = userPoints
          bestWeek = week
        }
      })
      
      return { week: bestWeek, points: maxPoints }
    }
  
    // Total active days
    async getTotalActiveDays() {
      const entries = await this.getAllEntries()
      return Object.keys(entries).length
    }
  
    // Average points per day
    async getAveragePointsPerDay() {
      const entries = await this.getAllEntries()
      const totalDays = Object.keys(entries).length
      if (totalDays === 0) return 0
      
      let totalPoints = 0
      Object.values(entries).forEach(dayEntries => {
        Object.values(dayEntries).forEach(points => {
          totalPoints += points
        })
      })
      
      return Math.round((totalPoints / totalDays) * 10) / 10
    }
  
    // Export/Import
    async exportJSON() {
      const users = await this.getUsers()
      const entries = await this.getAllEntries()
      
      const data = {
        version: 2, // Updated version for new member system
        members: users.map(user => ({
          user_id: user.user_id,
          display_name: user.display_name,
          color: user.color,
          avatar: user.avatar,
          role: user.role
        })),
        entries,
        meta: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          source: 'supabase-members'
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `gym-points-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    }
  
    async exportCSV() {
      const users = await this.getUsers()
      const entries = await this.getAllEntries()
      const dates = Object.keys(entries).sort((a, b) => b.localeCompare(a))
      
      let csv = 'fecha,usuario,puntos\n'
      
      dates.forEach(date => {
        const dayEntries = entries[date]
        Object.keys(dayEntries).forEach(userId => {
          const user = users.find(u => u.user_id === userId)
          if (user) {
            csv += `${date},${user.display_name},${dayEntries[userId]}\n`
          }
        })
      })
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `gym-points-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    }
  
    // Import is not supported for member system - users must join via invitations
    async importJSON(file, mode = 'replace') {
      throw new Error('La importación no está disponible con el sistema de invitaciones. Los usuarios deben unirse mediante códigos de invitación.')
    }
  
    // Check if data exists
    async hasData() {
      const users = await this.getUsers()
      return users.length > 0
    }
  
    // Clear all data - only clears current user's entries
    async clearAllData() {
      const groupId = await this.getCurrentGroup()
      const currentMember = await this.getCurrentMemberRecord()
      
      if (groupId && currentMember) {
        // Only delete current user's entries
        await supabase
          .from(TABLES.ENTRIES)
          .delete()
          .eq('group_id', groupId)
          .eq('member_id', currentMember.id)
      }
      
      return true
    }
  
    // Get today's date key
    getTodayKey() {
      return new Date().toISOString().split('T')[0]
    }
  
    // Generate unique user ID (for compatibility)
    generateUserId() {
      return 'u' + Date.now() + Math.random().toString(36).substr(2, 9)
    }
  
    // Get storage status
    getStorageStatus() {
      return {
        useSupabase: true,
        isOnline: this.isOnline,
        configured: true,
        system: 'members'
      }
    }
  
    // Legacy compatibility methods
    async getSelectedGymUser() {
      // In new system, selected user is always current user
      const user = useUserStore().getUser
      return user?.id || null
    }
  
    async setSelectedGymUser(userId) {
      // In new system, users can only manage their own data
      // This is kept for compatibility but doesn't do anything
      return true
    }
  
    async getSelectedGymUserData() {
      // Return current user's member data
      return await this.getCurrentMemberRecord()
    }
  }
  
  // Create singleton instance
  export const storage = new StorageService()
  