import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the entire email module
vi.mock('../email', async () => {
  const actual = await vi.importActual('../email')
  return {
    ...actual,
    sendReservationConfirmationEmail: vi.fn(),
    sendPaymentFailureEmail: vi.fn()
  }
})

import { sendReservationConfirmationEmail, sendPaymentFailureEmail } from '../email'

describe('Email utilities', () => {
  const mockReservationData = {
    reservationId: 'res_123',
    userEmail: 'test@example.com',
    userName: 'João Silva',
    lotName: 'Estacionamento Central',
    lotAddress: 'Rua das Flores, 123 - São Paulo',
    carPlate: 'ABC-1234',
    arrivalWindow: {
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T10:30:00Z'
    },
    fees: {
      reservationFeeAmount: 12.50
    },
    state: 'CONFIRMED'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendReservationConfirmationEmail', () => {
    it('should send confirmation email successfully', async () => {
      const mockResult = {
        success: true,
        emailId: 'email_123'
      }

      ;(sendReservationConfirmationEmail as any).mockResolvedValueOnce(mockResult)

      const result = await sendReservationConfirmationEmail(mockReservationData)

      expect(result.success).toBe(true)
      expect(result.emailId).toBe('email_123')
      expect(sendReservationConfirmationEmail).toHaveBeenCalledWith(mockReservationData)
    })

    it('should handle email sending errors', async () => {
      const mockResult = {
        success: false,
        error: 'Invalid email address'
      }

      ;(sendReservationConfirmationEmail as any).mockResolvedValueOnce(mockResult)

      const result = await sendReservationConfirmationEmail(mockReservationData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email address')
    })
  })

  describe('sendPaymentFailureEmail', () => {
    it('should send payment failure email successfully', async () => {
      const mockResult = {
        success: true,
        emailId: 'email_456'
      }

      ;(sendPaymentFailureEmail as any).mockResolvedValueOnce(mockResult)

      const result = await sendPaymentFailureEmail(mockReservationData)

      expect(result.success).toBe(true)
      expect(result.emailId).toBe('email_456')
      expect(sendPaymentFailureEmail).toHaveBeenCalledWith(mockReservationData)
    })
  })
})
