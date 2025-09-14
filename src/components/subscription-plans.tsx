'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  currency: string;
  features: string[];
  maxParkingLots: number;
  maxReservationsPerMonth: number;
  stripePriceId: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  selectedPlanId?: string;
  onPlanSelect: (planId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function SubscriptionPlans({
  plans,
  selectedPlanId,
  onPlanSelect,
  isLoading = false,
  className
}: SubscriptionPlansProps) {
  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('starter')) return Building2;
    if (planName.toLowerCase().includes('pro')) return Zap;
    if (planName.toLowerCase().includes('enterprise')) return Star;
    return Building2;
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-lg">
          Select a subscription plan to start managing your parking lots
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.name);
          const isSelected = selectedPlanId === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-lg",
                plan.isPopular && "border-primary"
              )}
              onClick={() => onPlanSelect(plan.id)}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-full",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Parking Lots</span>
                    <span className="font-medium">
                      {plan.maxParkingLots === -1 ? 'Unlimited' : plan.maxParkingLots}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Reservations/month</span>
                    <span className="font-medium">
                      {plan.maxReservationsPerMonth === -1 ? 'Unlimited' : plan.maxReservationsPerMonth.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!selectedPlanId && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Please select a plan to continue
          </p>
        </div>
      )}
    </div>
  );
}
