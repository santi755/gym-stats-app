import { supabase, TABLES, getCurrentUser } from '../config/supabase.js'

// Supabase-only storage service
export class StorageService {
  constructor() {
    this.currentGroupId = null
    this.isOnline = navigator.onLine
    this.setupOnlineListener()
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
    const user = await getCurrentUser()
    return !!user
  }

  // Group management
  async createGroup(name, description = '') {
    const user = await getCurrentUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .insert({
        name,
        description,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error
    this.currentGroupId = data.id
    return data
  }

  async getGroups() {
    const user = await getCurrentUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async setCurrentGroup(groupId) {
    this.currentGroupId = groupId
    localStorage.setItem('currentGroupId', groupId)
  }

  async getCurrentGroup() {
    if (!this.currentGroupId) {
      this.currentGroupId = localStorage.getItem('currentGroupId')
    }
    return this.currentGroupId
  }

  // User management
  async addUser(name, color = '#3b82f6', avatar = null) {
    const groupId = await this.getCurrentGroup()
    if (!groupId) throw new Error('No hay grupo seleccionado')

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert({
        group_id: groupId,
        name,
        color,
        avatar
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUsers() {
    const groupId = await this.getCurrentGroup()
    if (!groupId) return []

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteUser(userId) {
    const { error } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId)

    if (error) throw error
    return true
  }

  // Entry management
  async setUserPoints(date, userId, points) {
    const groupId = await this.getCurrentGroup()
    if (!groupId) throw new Error('No hay grupo seleccionado')

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .upsert({
        group_id: groupId,
        user_id: userId,
        date,
        points
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserPoints(date, userId) {
    const groupId = await this.getCurrentGroup()
    if (!groupId) return 0

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .select('points')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.points || 0
  }

  async getDateEntries(date) {
    const groupId = await this.getCurrentGroup()
    if (!groupId) return {}

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .select('user_id, points')
      .eq('group_id', groupId)
      .eq('date', date)

    if (error) throw error
    
    const entries = {}
    data.forEach(entry => {
      entries[entry.user_id] = entry.points
    })
    return entries
  }

  async getAllEntries() {
    const groupId = await this.getCurrentGroup()
    if (!groupId) return {}

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .select('date, user_id, points')
      .eq('group_id', groupId)
      .order('date', { ascending: false })

    if (error) throw error
    
    const entries = {}
    data.forEach(entry => {
      if (!entries[entry.date]) {
        entries[entry.date] = {}
      }
      entries[entry.date][entry.user_id] = entry.points
    })
    return entries
  }

  // Statistics
  async getUserTotal(userId) {
    const groupId = await this.getCurrentGroup()
    if (!groupId) return 0

    const { data, error } = await supabase
      .from(TABLES.ENTRIES)
      .select('points')
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error
    
    return data.reduce((total, entry) => total + entry.points, 0)
  }

  async getAllTotals() {
    const users = await this.getUsers()
    const totals = {}
    
    for (const user of users) {
      totals[user.id] = await this.getUserTotal(user.id)
    }
    
    return totals
  }

  async getLeaderboard() {
    const users = await this.getUsers()
    const totals = await this.getAllTotals()
    
    return users
      .map(user => ({
        id: user.id,
        name: user.name,
        color: user.color,
        avatar: user.avatar,
        total: totals[user.id] || 0
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
          weekPoints += await this.getUserPoints(dateKey, user.id)
        }
        weekData.users[user.id] = {
          name: user.name,
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
          monthPoints += await this.getUserPoints(dateKey, user.id)
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        monthData.users[user.id] = {
          name: user.name,
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
      version: 1,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        color: user.color,
        avatar: user.avatar
      })),
      entries,
      meta: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        source: 'supabase'
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
        const user = users.find(u => u.id === userId)
        if (user) {
          csv += `${date},${user.name},${dayEntries[userId]}\n`
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

  async importJSON(file, mode = 'replace') {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (mode === 'replace') {
      // Clear existing data
      const groupId = await this.getCurrentGroup()
      if (groupId) {
        await supabase.from(TABLES.ENTRIES).delete().eq('group_id', groupId)
        await supabase.from(TABLES.USERS).delete().eq('group_id', groupId)
      }
    }

    // Import users
    for (const user of data.users) {
      await this.addUser(user.name, user.color, user.avatar)
    }

    // Import entries
    for (const [date, dayEntries] of Object.entries(data.entries)) {
      for (const [userId, points] of Object.entries(dayEntries)) {
        await this.setUserPoints(date, userId, points)
      }
    }

    return true
  }

  // Check if data exists
  async hasData() {
    const users = await this.getUsers()
    return users.length > 0
  }

  // Clear all data
  async clearAllData() {
    const groupId = await this.getCurrentGroup()
    if (groupId) {
      await supabase.from(TABLES.ENTRIES).delete().eq('group_id', groupId)
      await supabase.from(TABLES.USERS).delete().eq('group_id', groupId)
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
      configured: true
    }
  }
}

// Create singleton instance
export const storage = new StorageService()
