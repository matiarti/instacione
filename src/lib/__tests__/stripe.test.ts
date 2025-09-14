import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatAmount } from '../stripe'

// Mock fetch globally
global.fetch = vi.fn()

describe('Stripe utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatAmount', () => {
    it('should format amount in Brazilian Real by default', () => {
      const result = formatAmount(12.50)
      expect(result).toContain('R$')
      expect(result).toContain('12,50')
    })

    it('should format amount with different currency', () => {
      const result = formatAmount(12.50, 'USD')
      expect(result).toContain('US$')
      expect(result).toContain('12,50')
    })

    it('should handle zero amount', () => {
      const result = formatAmount(0)
      expect(result).toContain('R$')
      expect(result).toContain('0,00')
    })

    it('should handle large amounts', () => {
      const result = formatAmount(1234.56)
      expect(result).toContain('R$')
      expect(result).toContain('1.234,56')
    })

    it('should handle decimal amounts correctly', () => {
      const result = formatAmount(0.99)
      expect(result).toContain('R$')
      expect(result).toContain('0,99')
    })
  })

  describe('createPaymentIntent', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = {
        success: true,
        clientSecret: 'pi_test_123',
        amount: 12.50
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { createPaymentIntent } = await import('../stripe')
      
      const result = await createPaymentIntent('reservation_123')
      
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId: 'reservation_123' }),
      })
      
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API call fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { createPaymentIntent } = await import('../stripe')
      
      await expect(createPaymentIntent('reservation_123')).rejects.toThrow('Failed to create payment intent')
    })
  })
})
