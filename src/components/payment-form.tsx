'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

// Defer Stripe loading until actually needed
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

interface PaymentFormProps {
  reservationId: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

function PaymentForm({ reservationId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/reservation/success?reservation=${reservationId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An unexpected error occurred.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {message && (
        <Alert className={message.includes('succeeded') ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}>
          <div className="flex items-center">
            {message.includes('succeeded') ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription className="ml-2">
              {message}
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        disabled={isLoading || !stripe || !elements}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay R$ ${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function PaymentFormWrapper({ reservationId, amount, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // First, try to load Stripe
        await getStripePromise();
        setStripeLoaded(true);

        // Then create payment intent
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

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment initialization error:', err);
        
        // Check if it's a blocked request error
        if (err instanceof Error && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('ERR_BLOCKED_BY_CLIENT') ||
          err.message.includes('blocked')
        )) {
          setError('Payment system is being blocked. Please disable ad blockers or browser extensions and try again.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [reservationId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Setting up payment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !clientSecret || !stripeLoaded) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="ml-2">
              {error || 'Failed to initialize payment'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get CSS custom properties from the current theme
  const getCSSVariable = (property: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(property)
        .trim();
    }
    return '';
  };

  // Determine if we're in dark mode
  const isDarkMode = resolvedTheme === 'dark';

  // Create appearance variables using CSS custom properties
  const createAppearanceVariables = () => {
    const blue = getCSSVariable('--color-primary') || 'hsl(262.1 83.3% 57.8%)';
    const background = getCSSVariable('--color-background') || 'hsl(0 0% 100%)';
    const foreground = getCSSVariable('--color-foreground') || 'hsl(224 71.4% 4.1%)';
    const secondary = getCSSVariable('--color-secondary') || 'hsl(220 14.3% 95.9%)';
    const mutedForeground = getCSSVariable('--color-muted-foreground') || 'hsl(220 8.9% 46.1%)';
    const border = getCSSVariable('--color-border') || 'hsl(220 13% 91%)';
    const destructive = getCSSVariable('--color-destructive') || 'hsl(0 84.2% 60.2%)';

    return {
      colorblue: blue,
      colorText: foreground,
      colorBackground: background,
      buttonSecondaryColorBackground: secondary,
      buttonSecondaryColorText: foreground,
      colorSecondaryText: mutedForeground,
      actionSecondaryColorText: foreground,
      actionSecondaryTextDecorationColor: foreground,
      colorBorder: border,
      colorDanger: destructive,
      badgeNeutralColorBackground: secondary,
      badgeNeutralColorBorder: border,
      badgeNeutralColorText: mutedForeground,
      badgeSuccessColorBackground: isDarkMode ? 'hsl(120 60% 15%)' : 'hsl(120 60% 90%)',
      badgeSuccessColorBorder: isDarkMode ? 'hsl(120 60% 20%)' : 'hsl(120 60% 80%)',
      badgeSuccessColorText: isDarkMode ? 'hsl(120 60% 70%)' : 'hsl(120 60% 30%)',
      badgeWarningColorBackground: isDarkMode ? 'hsl(30 60% 15%)' : 'hsl(30 60% 90%)',
      badgeWarningColorBorder: isDarkMode ? 'hsl(30 60% 20%)' : 'hsl(30 60% 80%)',
      badgeWarningColorText: isDarkMode ? 'hsl(30 60% 70%)' : 'hsl(30 60% 30%)',
      badgeDangerColorBackground: isDarkMode ? 'hsl(0 60% 15%)' : 'hsl(0 60% 90%)',
      badgeDangerColorBorder: isDarkMode ? 'hsl(0 60% 20%)' : 'hsl(0 60% 80%)',
      badgeDangerColorText: isDarkMode ? 'hsl(0 60% 70%)' : 'hsl(0 60% 30%)',
      offsetBackgroundColor: secondary,
      formBackgroundColor: background,
      overlayBackdropColor: 'rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    };
  };

  const appearanceVariables = createAppearanceVariables();

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: appearanceVariables,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements options={options} stripe={getStripePromise()}>
          <PaymentForm 
            reservationId={reservationId}
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
