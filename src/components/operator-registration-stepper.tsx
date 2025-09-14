'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle, CreditCard, User, Mail, Lock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionPlans, SubscriptionPlan } from './subscription-plans';

interface OperatorData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
}

interface OperatorRegistrationStepperProps {
  className?: string;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 'account', title: 'Account Details', icon: User },
  { id: 'subscription', title: 'Choose Plan', icon: CreditCard },
];

export function OperatorRegistrationStepper({
  className,
  onSuccess,
}: OperatorRegistrationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  const [operatorData, setOperatorData] = useState<OperatorData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
  });
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('Fetching subscription plans...');
        const response = await fetch('/api/subscription-plans');
        console.log('Subscription plans response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Subscription plans data:', data);
          setSubscriptionPlans(data.plans);
        } else {
          console.error('Failed to fetch subscription plans:', response.status, response.statusText);
          // Fallback to default plans if API fails
          setSubscriptionPlans([
            {
              id: '68c7406f3090971587d4009e',
              name: 'Starter',
              description: 'Perfect for small parking lots',
              price: 2990,
              currency: 'BRL',
              features: ['Up to 2 parking lots', '100 reservations per month', 'Basic analytics', 'Email support'],
              maxParkingLots: 2,
              maxReservationsPerMonth: 100,
              stripePriceId: 'price_starter_monthly',
            },
            {
              id: '68c7406f3090971587d4009f',
              name: 'Professional',
              description: 'Ideal for growing businesses',
              price: 5990,
              currency: 'BRL',
              features: ['Up to 10 parking lots', '1,000 reservations per month', 'Advanced analytics', 'Priority support', 'Custom branding'],
              maxParkingLots: 10,
              maxReservationsPerMonth: 1000,
              stripePriceId: 'price_pro_monthly',
              isPopular: true,
            },
            {
              id: '68c7406f3090971587d400a0',
              name: 'Enterprise',
              description: 'For large parking operations',
              price: 9990,
              currency: 'BRL',
              features: ['Unlimited parking lots', 'Unlimited reservations', 'Full analytics suite', '24/7 phone support', 'Custom integrations', 'Dedicated account manager'],
              maxParkingLots: -1,
              maxReservationsPerMonth: -1,
              stripePriceId: 'price_enterprise_monthly',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        // Fallback to default plans if fetch fails
        setSubscriptionPlans([
          {
            id: '68c7406f3090971587d4009e',
            name: 'Starter',
            description: 'Perfect for small parking lots',
            price: 2990,
            currency: 'BRL',
            features: ['Up to 2 parking lots', '100 reservations per month', 'Basic analytics', 'Email support'],
            maxParkingLots: 2,
            maxReservationsPerMonth: 100,
            stripePriceId: 'price_starter_monthly',
          },
          {
            id: '68c7406f3090971587d4009f',
            name: 'Professional',
            description: 'Ideal for growing businesses',
            price: 5990,
            currency: 'BRL',
            features: ['Up to 10 parking lots', '1,000 reservations per month', 'Advanced analytics', 'Priority support', 'Custom branding'],
            maxParkingLots: 10,
            maxReservationsPerMonth: 1000,
            stripePriceId: 'price_pro_monthly',
            isPopular: true,
          },
          {
            id: '68c7406f3090971587d400a0',
            name: 'Enterprise',
            description: 'For large parking operations',
            price: 9990,
            currency: 'BRL',
            features: ['Unlimited parking lots', 'Unlimited reservations', 'Full analytics suite', '24/7 phone support', 'Custom integrations', 'Dedicated account manager'],
            maxParkingLots: -1,
            maxReservationsPerMonth: -1,
            stripePriceId: 'price_enterprise_monthly',
          },
        ]);
      }
    };

    fetchPlans();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOperatorData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Account details
        if (!operatorData.name || !operatorData.email || !operatorData.password || 
            !operatorData.phone || !operatorData.companyName) {
          setMessage('Please fill in all required fields');
          setMessageType('error');
          return false;
        }
        if (operatorData.password !== operatorData.confirmPassword) {
          setMessage('Passwords do not match');
          setMessageType('error');
          return false;
        }
        if (operatorData.password.length < 6) {
          setMessage('Password must be at least 6 characters');
          setMessageType('error');
          return false;
        }
        return true;
      case 1: // Subscription
        if (!selectedPlanId) {
          setMessage('Please select a subscription plan');
          setMessageType('error');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setMessage('');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setMessage('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Submitting registration with data:', {
        ...operatorData,
        selectedPlanId,
      });

      // Create operator account with subscription
      const response = await fetch('/api/auth/register-operator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...operatorData,
          selectedPlanId,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Registration failed:', data);
        setMessage(data.error || 'Failed to create operator account');
        setMessageType('error');
      } else {
        console.log('Registration successful:', data);
        setMessage('Operator account created successfully! Setting up payment...');
        setMessageType('success');
        
        // Store subscription data and user info for payment setup
        const paymentData = {
          subscription: data.subscription,
          user: {
            email: operatorData.email,
            name: operatorData.name,
          }
        };
        localStorage.setItem('pendingSubscription', JSON.stringify(paymentData));
        
        // Redirect to payment setup page
        setTimeout(() => {
          window.location.href = '/auth/setup-payment?subscriptionId=' + data.subscription.id;
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Your Company Name"
                  value={operatorData.companyName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={operatorData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={operatorData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={operatorData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={operatorData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={operatorData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <SubscriptionPlans
            plans={subscriptionPlans}
            selectedPlanId={selectedPlanId}
            onPlanSelect={setSelectedPlanId}
            isLoading={isLoading}
          />
        );


      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Register as Operator</CardTitle>
        <CardDescription>
          Create your parking lot company account and choose a subscription plan
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && !isCompleted && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-muted-foreground"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            Previous
          </Button>
          
          {currentStep === 0 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
