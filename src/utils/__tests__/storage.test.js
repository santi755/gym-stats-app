import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTodayKey,
  generateUserId,
  loadData,
  saveData,
  addUser,
  setUserPoints,
  getUserPoints,
  getUserTotal,
  getAllTotals,
  getLeaderboard,
  exportJSON,
  clearAllData,
  hasData
} from '../storage.js'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage mock to return null (no data)
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('getTodayKey', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(getTodayKey()).toBe(today)
    })
  })

  describe('generateUserId', () => {
    it('should generate unique user IDs', () => {
      const id1 = generateUserId()
      const id2 = generateUserId()
      
      expect(id1).toMatch(/^u\d+/)
      expect(id2).toMatch(/^u\d+/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('loadData', () => {
    it('should return default data when no data exists', () => {
      const data = loadData()
      
      expect(data).toHaveProperty('version', 1)
      expect(data).toHaveProperty('users', [])
      expect(data).toHaveProperty('entries', {})
      expect(data).toHaveProperty('meta')
      expect(data.meta).toHaveProperty('createdAt')
      expect(data.meta).toHaveProperty('lastModified')
    })

    it('should load existing data from localStorage', () => {
      const mockData = {
        version: 1,
        users: [{ id: 'u1', name: 'Test User', color: '#ff0000' }],
        entries: { '2025-01-01': { u1: 1 } },
        meta: { createdAt: '2025-01-01T00:00:00Z', lastModified: '2025-01-01T00:00:00Z' }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))
      
      const data = loadData()
      expect(data.users).toHaveLength(1)
      expect(data.users[0].name).toBe('Test User')
      expect(data.entries['2025-01-01'].u1).toBe(1)
    })
  })

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      const testData = {
        version: 1,
        users: [],
        entries: {},
        meta: { createdAt: '2025-01-01T00:00:00Z', lastModified: '2025-01-01T00:00:00Z' }
      }
      
      const result = saveData(testData)
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gym-points-v1',
        expect.stringContaining('"version":1')
      )
    })
  })

  describe('addUser', () => {
    it('should add a new user to the data', () => {
      const user = addUser('Test User', '#ff0000')
      
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name', 'Test User')
      expect(user).toHaveProperty('color', '#ff0000')
      expect(user.id).toMatch(/^u\d+/)
    })
  })

  describe('setUserPoints and getUserPoints', () => {
    it('should set and get user points for a specific date', () => {
      const today = getTodayKey()
      const userId = 'u1'
      const points = 2
      
      setUserPoints(today, userId, points)
      const retrievedPoints = getUserPoints(today, userId)
      
      expect(retrievedPoints).toBe(points)
    })

    it('should return 0 for non-existent entries', () => {
      const points = getUserPoints('2025-01-01', 'nonexistent')
      expect(points).toBe(0)
    })
  })

  describe('getUserTotal', () => {
    it('should calculate total points for a user across all dates', () => {
      const userId = 'u1'
      const today = getTodayKey()
      
      // Set points for multiple dates
      setUserPoints('2025-01-01', userId, 1)
      setUserPoints('2025-01-02', userId, 2)
      setUserPoints(today, userId, 1)
      
      const total = getUserTotal(userId)
      expect(total).toBe(4)
    })
  })

  describe('getAllTotals', () => {
    it('should return totals for all users', () => {
      const user1 = addUser('User 1')
      const user2 = addUser('User 2')
      
      setUserPoints(getTodayKey(), user1.id, 2)
      setUserPoints(getTodayKey(), user2.id, 1)
      
      const totals = getAllTotals()
      
      expect(totals[user1.id]).toBe(2)
      expect(totals[user2.id]).toBe(1)
    })
  })

  describe('getLeaderboard', () => {
    it('should return users sorted by total points', () => {
      // Mock data with specific users and points
      const mockData = {
        version: 1,
        users: [
          { id: 'u1', name: 'User 1', color: '#ff0000' },
          { id: 'u2', name: 'User 2', color: '#00ff00' },
          { id: 'u3', name: 'User 3', color: '#0000ff' }
        ],
        entries: {
          [getTodayKey()]: { u1: 1, u2: 3, u3: 2 }
        },
        meta: { createdAt: '2025-01-01T00:00:00Z', lastModified: '2025-01-01T00:00:00Z' }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))
      
      const leaderboard = getLeaderboard()
      
      // Check that we have 3 users
      expect(leaderboard).toHaveLength(3)
      
      // Check that they are sorted by total points (descending)
      expect(leaderboard[0].total).toBe(3)
      expect(leaderboard[1].total).toBe(2)
      expect(leaderboard[2].total).toBe(1)
      
      // Check that the names match the expected order
      expect(leaderboard[0].name).toBe('User 2')
      expect(leaderboard[1].name).toBe('User 3')
      expect(leaderboard[2].name).toBe('User 1')
    })
  })

  describe('exportJSON', () => {
    it('should create a downloadable JSON file', () => {
      // Mock DOM methods
      const mockBlob = { type: 'application/json' }
      const mockURL = 'blob:mock-url'
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      
      global.Blob = vi.fn(() => mockBlob)
      global.URL.createObjectURL = vi.fn(() => mockURL)
      global.URL.revokeObjectURL = vi.fn()
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      
      exportJSON()
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toMatch(/gym-points-\d{4}-\d{2}-\d{2}\.json/)
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })
  })

  describe('clearAllData', () => {
    it('should clear all data from localStorage', () => {
      clearAllData()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('gym-points-v1')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUserId')
    })
  })

  describe('hasData', () => {
    it('should return false when no users exist', () => {
      // Mock empty data
      const mockData = {
        version: 1,
        users: [],
        entries: {},
        meta: { createdAt: '2025-01-01T00:00:00Z', lastModified: '2025-01-01T00:00:00Z' }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))
      
      expect(hasData()).toBe(false)
    })

    it('should return true when users exist', () => {
      // Mock data with users
      const mockData = {
        version: 1,
        users: [{ id: 'u1', name: 'Test User', color: '#ff0000' }],
        entries: {},
        meta: { createdAt: '2025-01-01T00:00:00Z', lastModified: '2025-01-01T00:00:00Z' }
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))
      
      expect(hasData()).toBe(true)
    })
  })
})
