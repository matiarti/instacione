import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authOptions } from '../auth'

// Mock dependencies
vi.mock('../mongodb', () => ({
  default: vi.fn()
}))

vi.mock('../../../models/User', () => ({
  default: vi.fn()
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn()
  }
}))

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct session strategy', () => {
    expect(authOptions.session.strategy).toBe('jwt')
  })

  it('should have credentials provider configured', () => {
    const credentialsProvider = authOptions.providers.find(
      provider => provider.id === 'credentials'
    )
    
    expect(credentialsProvider).toBeDefined()
    expect(credentialsProvider?.name).toBe('credentials')
  })

  it('should have correct credentials configuration', () => {
    const credentialsProvider = authOptions.providers.find(
      provider => provider.id === 'credentials'
    ) as any
    
    expect(credentialsProvider.credentials).toEqual({
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    })
  })

  it('should have correct pages configuration', () => {
    expect(authOptions.pages).toEqual({
      signIn: '/auth/signin',
      verifyRequest: '/auth/verify'
    })
  })

  describe('Credentials Provider Authorize Function', () => {
    it('should return null for missing credentials', async () => {
      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({})
      expect(result).toBeNull()
    })

    it('should return null for missing email', async () => {
      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        password: 'password123'
      })
      expect(result).toBeNull()
    })

    it('should return null for missing password', async () => {
      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        email: 'test@example.com'
      })
      expect(result).toBeNull()
    })

    it('should return null when user is not found', async () => {
      const { default: User } = require('../../../models/User')
      User.findOne = vi.fn().mockResolvedValue(null)

      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result).toBeNull()
    })

    it('should return null when user has no password', async () => {
      const { default: User } = require('../../../models/User')
      User.findOne = vi.fn().mockResolvedValue({
        _id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER'
        // No password field
      })

      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result).toBeNull()
    })

    it('should return null for invalid password', async () => {
      const { default: User } = require('../../../models/User')
      const bcrypt = require('bcryptjs')
      
      User.findOne = vi.fn().mockResolvedValue({
        _id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER',
        password: 'hashed_password'
      })
      
      bcrypt.default.compare = vi.fn().mockResolvedValue(false)

      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      
      expect(result).toBeNull()
      expect(bcrypt.default.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password')
    })

    it('should return user object for valid credentials', async () => {
      const { default: User } = require('../../../models/User')
      const bcrypt = require('bcryptjs')
      
      const mockUser = {
        _id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER',
        password: 'hashed_password'
      }
      
      User.findOne = vi.fn().mockResolvedValue(mockUser)
      bcrypt.default.compare = vi.fn().mockResolvedValue(true)

      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      ) as any

      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER'
      })
      expect(bcrypt.default.compare).toHaveBeenCalledWith('password123', 'hashed_password')
    })
  })

  describe('Callbacks', () => {
    it('should have signIn callback that returns true', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { id: 'user_123', email: 'test@example.com' },
        account: { provider: 'credentials' },
        profile: {}
      })
      
      expect(result).toBe(true)
    })

    it('should have jwt callback that adds role to token', async () => {
      const result = await authOptions.callbacks?.jwt?.({
        token: { sub: 'user_123' },
        user: { role: 'DRIVER' }
      })
      
      expect(result).toEqual({
        sub: 'user_123',
        role: 'DRIVER'
      })
    })

    it('should have session callback that adds user data to session', async () => {
      const result = await authOptions.callbacks?.session?.({
        session: { user: {} },
        token: { sub: 'user_123', role: 'DRIVER' }
      })
      
      expect(result).toEqual({
        user: {
          id: 'user_123',
          role: 'DRIVER'
        }
      })
    })
  })
})
