'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionData {
  id: string;
  planId: string;
  status: string;
  trialEnd: string;
  plan: {
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
  };
}

interface UserData {
  email: string;
  name: string;
}

interface PaymentData {
  subscription: SubscriptionData;
  user: UserData;
}

export default function SetupPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get subscription data from URL params or localStorage
    const subscriptionId = searchParams.get('subscriptionId');
    if (subscriptionId) {
      fetchSubscriptionData(subscriptionId);
    }
  }, [searchParams]);

  const fetchSubscriptionData = async (subscriptionId: string) => {
    try {
      setIsLoadingData(true);
      
      // Get the stored subscription data from registration
      const storedData = localStorage.getItem('pendingSubscription');
      if (storedData) {
        const paymentData: PaymentData = JSON.parse(storedData);
        const subscriptionData = paymentData.subscription;
        setUserData(paymentData.user);
        
        // Fetch the full plan details from the API
        const planResponse = await fetch('/api/subscription-plans');
        if (planResponse.ok) {
          const plansData = await planResponse.json();
          const plan = plansData.plans.find((p: any) => p.id === subscriptionData.planId);
          
          if (plan) {
            setSubscription({
              ...subscriptionData,
              plan: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                currency: plan.currency,
                features: plan.features,
              }
            });
          } else {
            // Fallback if plan not found
            setSubscription({
              ...subscriptionData,
              plan: {
                name: 'Selected Plan',
                description: 'Your chosen subscription plan',
                price: 2990, // Default price
                currency: 'BRL',
                features: ['Basic features included'],
              }
            });
          }
        } else {
          // Fallback if API fails
          setSubscription({
            ...subscriptionData,
            plan: {
              name: 'Selected Plan',
              description: 'Your chosen subscription plan',
              price: 2990,
              currency: 'BRL',
              features: ['Basic features included'],
            }
          });
        }
      } else {
        setError('No subscription data found. Please try registering again.');
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSetupPayment = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError('');

    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          userEmail: userData?.email || 'user@example.com',
          userName: userData?.name || 'User Name',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Payment setup error:', error);
      setError('Failed to setup payment. Please try again.');
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription>
              Setting up your subscription details...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Setup Complete!</CardTitle>
            <CardDescription>
              Your subscription is now active. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Subscription</CardTitle>
          <CardDescription>
            Set up your payment method to activate your subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {subscription && subscription.plan && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Subscription Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{subscription.plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    {formatPrice(subscription.plan.price, subscription.plan.currency)}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trial Ends:</span>
                  <span className="font-medium">{formatDate(subscription.trialEnd)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Your account is created and ready to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>You&apos;re currently in a 7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Set up payment to continue after trial ends</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleSetupPayment}
              disabled={isLoading || !subscription}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Setting up payment...' : 'Set Up Payment Method'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/operator')}
              className="w-full"
            >
              Continue to Dashboard (Skip for now)
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              You can set up payment later from your dashboard. 
              Your trial will end on {subscription ? formatDate(subscription.trialEnd) : 'the trial end date'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
