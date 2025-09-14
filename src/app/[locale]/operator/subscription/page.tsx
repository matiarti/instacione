'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionData {
  id: string;
  planId: string;
  status: 'active' | 'trial' | 'inactive' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  plan: {
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
    maxParkingLots: number;
    maxReservationsPerMonth: number;
  };
}

export default function OperatorSubscriptionPage() {
  const { data: session } = useSession();
  const t = useTranslations();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operator/subscription');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription information');
    } finally {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active' },
      trial: { variant: 'secondary' as const, icon: Clock, text: 'Trial' },
      inactive: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Inactive' },
      canceled: { variant: 'outline' as const, icon: AlertTriangle, text: 'Canceled' },
      past_due: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Past Due' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe customer portal or payment management
    window.open('/api/stripe/customer-portal', '_blank');
  };

  const handleUpgradePlan = () => {
    // Redirect to plan upgrade page
    window.location.href = '/operator/subscription/upgrade';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Subscription Found</CardTitle>
              <CardDescription>
                You don&apos;t have an active subscription. Please contact support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/auth/register-operator'}>
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isTrialExpired = subscription.status === 'trial' && 
    subscription.trialEnd && 
    new Date(subscription.trialEnd) < new Date();

  const isSubscriptionExpired = subscription.status === 'past_due' ||
    (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your parking lot management subscription
          </p>
        </div>

        {/* Status Alert */}
        {(isTrialExpired || isSubscriptionExpired) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isTrialExpired 
                ? 'Your trial period has expired. Please upgrade to continue using the service.'
                : 'Your subscription has expired. Please update your payment method to continue.'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                {getStatusBadge(subscription.status)}
              </div>
              <CardDescription>
                {subscription.plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {subscription.plan.name}
                </h3>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(subscription.plan.price, subscription.plan.currency)}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Parking Lots</span>
                  <span className="font-medium">
                    {subscription.plan.maxParkingLots === -1 
                      ? 'Unlimited' 
                      : subscription.plan.maxParkingLots
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reservations/month</span>
                  <span className="font-medium">
                    {subscription.plan.maxReservationsPerMonth === -1 
                      ? 'Unlimited' 
                      : subscription.plan.maxReservationsPerMonth.toLocaleString()
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleUpgradePlan}
                  className="w-full"
                  variant="outline"
                >
                  Upgrade Plan
                </Button>
                <Button 
                  onClick={handleManageSubscription}
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Period
                  </label>
                  <p className="text-sm">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                {subscription.trialEnd && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Trial Ends
                    </label>
                    <p className="text-sm">
                      {formatDate(subscription.trialEnd)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Next Billing Date
                  </label>
                  <p className="text-sm">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription will be canceled at the end of the current billing period.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="w-full"
                >
                  Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
