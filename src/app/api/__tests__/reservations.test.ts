import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../reservations/route'
import { NextRequest } from 'next/server'

// Mock MongoDB connection and models
vi.mock('../../../../lib/mongodb', () => ({
  default: vi.fn()
}))

vi.mock('../../../../models/Reservation', () => ({
  default: vi.fn().mockImplementation(() => ({
    _id: 'res_123',
    lotId: 'lot_123',
    userId: 'user_123',
    state: 'PENDING_PAYMENT',
    arrivalWindow: {
      start: new Date('2024-01-15T10:00:00Z'),
      end: new Date('2024-01-15T10:30:00Z')
    },
    car: { plate: 'ABC-1234' },
    priceEstimate: { hourly: 10, expectedHours: 2 },
    fees: { reservationPct: 0.12, reservationFeeAmount: 2.4 },
    payment: { provider: 'stripe', status: 'REQUIRES_PAYMENT' },
    save: vi.fn()
  }))
}))

// Mock ParkingLot model
// Mock User model
vi.mock('../../../../models/User', () => ({
  default: vi.fn().mockImplementation(() => ({
    _id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'DRIVER',
    save: vi.fn()
  })),
  findOne: vi.fn()
}))

vi.mock('../../../../models/ParkingLot', () => ({
  default: {
    findById: vi.fn()
  }
}))

describe.skip('/api/reservations', () => {
  const mockParkingLot = {
    _id: 'lot_123',
    name: 'Estacionamento Central',
    status: 'ACTIVE',
    availabilityManual: 5,
    pricing: { hourly: 10 },
    location: { address: 'Rua das Flores, 123' }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock ParkingLot.findById
    const { default: ParkingLot } = await import('../../../../models/ParkingLot')
    ;(ParkingLot as any).findById.mockResolvedValue(mockParkingLot)
    
    // Mock User.findOne to return null (user doesn't exist, will create new one)
    const { default: User } = await import('../../../../models/User')
    ;(User as any).findOne.mockResolvedValue(null)
  })

  describe('POST /api/reservations', () => {
    it('should create a reservation successfully', async () => {
      const requestBody = {
        lotId: 'lot_123',
        carPlate: 'ABC-1234',
        expectedHours: 2
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
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
      expect(data.reservation.id).toBe('res_123')
      expect(data.reservation.carPlate).toBe('ABC-1234')
      expect(data.reservation.fees.reservationFeeAmount).toBe(2.4)
    })

    it('should return 404 when parking lot is not found', async () => {
      const { default: ParkingLot } = await import('../../../../models/ParkingLot')
      ;(ParkingLot as any).findById.mockResolvedValue(null)

      const requestBody = {
        lotId: 'nonexistent_lot',
        carPlate: 'ABC-1234',
        expectedHours: 2
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Parking lot not found')
    })

    it('should return 400 when parking lot is inactive', async () => {
      const { default: ParkingLot } = await import('../../../../models/ParkingLot')
      ;(ParkingLot as any).findById.mockResolvedValue({
        ...mockParkingLot,
        status: 'INACTIVE'
      })

      const requestBody = {
        lotId: 'lot_123',
        carPlate: 'ABC-1234',
        expectedHours: 2
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Parking lot is not available')
    })

    it('should return 400 when no spots are available', async () => {
      const { default: ParkingLot } = await import('../../../../models/ParkingLot')
      ;(ParkingLot as any).findById.mockResolvedValue({
        ...mockParkingLot,
        availabilityManual: 0
      })

      const requestBody = {
        lotId: 'lot_123',
        carPlate: 'ABC-1234',
        expectedHours: 2
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No available spots')
    })

    it('should validate required fields', async () => {
      const requestBody = {
        lotId: 'lot_123',
        // Missing carPlate
        expectedHours: 2
      }

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500) // Zod validation error
    })
  })
})
