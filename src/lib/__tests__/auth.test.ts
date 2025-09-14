import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authOptions } from '../../../lib/auth'

// Mock dependencies
vi.mock('../../../lib/mongodb', () => ({
  default: vi.fn()
}))

vi.mock('../../../models/User', () => ({
  default: vi.fn().mockImplementation(() => ({
    _id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'DRIVER',
    save: vi.fn()
  })),
  findOne: vi.fn()
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn()
  }
}))

describe.skip('Auth Configuration', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { default: User } = await import('../../../models/User')
    vi.mocked(User.findOne).mockResolvedValue(null)
  })

  it('should have correct session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('should have credentials provider configured', () => {
    const credentialsProvider = authOptions.providers.find(
      provider => provider.id === 'credentials'
    )
    
    expect(credentialsProvider).toBeDefined()
    expect(credentialsProvider?.name).toBe('Credentials')
  })

  it('should have correct credentials configuration', () => {
    const credentialsProvider = authOptions.providers.find(
      provider => provider.id === 'credentials'
    ) as any
    
    expect(credentialsProvider.options.credentials).toEqual({
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
      const { default: User } = await import('../../../models/User')
      vi.mocked(User.findOne).mockResolvedValue(null)

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
      const { default: User } = await import('../../../models/User')
      ;(User as any).findOne.mockResolvedValue({
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
      const { default: User } = await import('../../../models/User')
      const bcrypt = await import('bcryptjs')
      
      ;(User as any).findOne.mockResolvedValue({
        _id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER',
        password: 'hashed_password'
      })
      
      ;(bcrypt.default.compare as any).mockResolvedValue(false)

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
      const { default: User } = await import('../../../models/User')
      const bcrypt = await import('bcryptjs')
      
      const mockUser = {
        _id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'DRIVER',
        password: 'hashed_password'
      }
      
      ;(User as any).findOne.mockResolvedValue(mockUser)
      ;(bcrypt.default.compare as any).mockResolvedValue(true)

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
        user: { id: 'user_123', email: 'test@example.com', role: 'DRIVER' },
        account: { provider: 'credentials', providerAccountId: 'test', type: 'credentials' },
        profile: {}
      })
      
      expect(result).toBe(true)
    })

    it('should have jwt callback that adds role to token', async () => {
      const result = await authOptions.callbacks?.jwt?.({
        token: { sub: 'user_123', role: 'DRIVER' },
        user: { id: 'user_123', email: 'test@example.com', role: 'DRIVER' },
        account: null
      })
      
      expect(result).toEqual({
        sub: 'user_123',
        role: 'DRIVER'
      })
    })

    it('should have session callback that adds user data to session', async () => {
      const result = await authOptions.callbacks?.session?.({
        session: { user: { id: 'user_123', email: 'test@example.com', name: 'Test User', role: 'DRIVER' }, expires: '2024-12-31T23:59:59.999Z' },
        token: { sub: 'user_123', role: 'DRIVER' },
        user: { id: 'user_123', email: 'test@example.com', name: 'Test User', role: 'DRIVER', emailVerified: null },
        newSession: {},
        trigger: 'update'
      } as any)
      
      expect(result).toEqual({
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'DRIVER'
        }
      })
    })
  })
})
