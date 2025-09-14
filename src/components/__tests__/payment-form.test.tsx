import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentFormWrapper from '../payment-form'

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    confirmPayment: vi.fn()
  }))
}))

// Mock Stripe React components
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: vi.fn()
  }),
  useElements: () => ({
    getElement: vi.fn()
  })
}))

// Mock fetch
global.fetch = vi.fn()

describe('PaymentFormWrapper', () => {
  const mockProps = {
    reservationId: 'res_123',
    amount: 12.50,
    onSuccess: vi.fn(),
    onError: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render payment form when client secret is loaded', async () => {
    // Mock successful payment intent creation
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        clientSecret: 'pi_test_123'
      })
    })

    render(<PaymentFormWrapper {...mockProps} />)

    // Should show loading initially
    expect(screen.getByText('Setting up payment...')).toBeInTheDocument()

    // Wait for payment form to load
    await waitFor(() => {
      expect(screen.getByTestId('elements')).toBeInTheDocument()
    })

    expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    expect(screen.getByText('Pay R$ 12.50')).toBeInTheDocument()
  })

  it('should show error when payment intent creation fails', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('API Error'))

    render(<PaymentFormWrapper {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show error when API returns error response', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid reservation' })
    })

    render(<PaymentFormWrapper {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to create payment intent')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

describe('PaymentForm (internal component)', () => {
  // Note: We're testing the wrapper component which includes the internal PaymentForm
  // In a real scenario, you might want to test the internal component separately
  // by extracting it and testing it with mocked Stripe hooks
  
  it('should call API with correct reservation ID', async () => {
    const testProps = {
      reservationId: 'res_123',
      amount: 12.50,
      onSuccess: vi.fn(),
      onError: vi.fn()
    }
    
    render(<PaymentFormWrapper {...testProps} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId: 'res_123' }),
      })
    })
  })
})
