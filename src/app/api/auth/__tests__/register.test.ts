import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../register/route'
import { NextRequest } from 'next/server'

// Mock MongoDB connection
vi.mock('../../../../../lib/mongodb', () => ({
  default: vi.fn()
}))

// Mock User model
const mockUser = {
  _id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'DRIVER',
  save: vi.fn()
}

vi.mock('../../../../../models/User', () => ({
  default: vi.fn().mockImplementation(() => mockUser)
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password_123')
  }
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should create a new user successfully', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('User created successfully')
      expect(data.user.name).toBe('Test User')
      expect(data.user.email).toBe('test@example.com')
      expect(data.user.role).toBe('DRIVER')
      expect(data.user.id).toBe('user_123')
    })

    it('should create user without phone number', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 400 when user already exists', async () => {
      const { default: User } = require('../../../../../models/User')
      User.findOne = vi.fn().mockResolvedValue({
        _id: 'existing_user',
        email: 'test@example.com'
      })

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email already exists')
    })

    it('should validate required fields', async () => {
      const requestBody = {
        // Missing name
        email: 'test@example.com',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })

    it('should validate email format', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })

    it('should validate password length', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too short
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })

    it('should handle database errors gracefully', async () => {
      const { default: User } = require('../../../../../models/User')
      User.findOne = vi.fn().mockRejectedValue(new Error('Database connection failed'))

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create user')
    })

    it('should hash password before saving', async () => {
      const bcrypt = require('bcryptjs')
      const { default: User } = require('../../../../../models/User')

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await POST(request)

      expect(bcrypt.default.hash).toHaveBeenCalledWith('password123', 12)
      expect(User).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
        phone: undefined,
        role: 'DRIVER',
        provider: 'credentials'
      })
    })
  })
})
