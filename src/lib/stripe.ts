import { loadStripe } from '@stripe/stripe-js';

// Defer Stripe loading until actually needed
let stripePromise: Promise<any> | null = null;

export const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Payment intent creation
export async function createPaymentIntent(reservationId: string) {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reservationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

// Process payment with Stripe
export async function processPayment(clientSecret: string, elements: any, confirmParams?: any) {
  const stripe = await getStripePromise();
  
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/reservation/success`,
      ...confirmParams,
    },
    redirect: 'if_required',
  });

  if (error) {
    throw error;
  }

  return paymentIntent;
}

// Refund processing
export async function processRefund(reservationId: string, amount?: number) {
  const response = await fetch('/api/payments/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reservationId, amount }),
  });

  if (!response.ok) {
    throw new Error('Failed to process refund');
  }

  return response.json();
}

// Format amount for display
export function formatAmount(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
