'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, Calendar, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface BillingInfo {
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    amount: number;
    currency: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    downloadUrl: string;
  }>;
}

export default function OperatorBilling() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/operator/subscription');
      if (response.ok) {
        const data = await response.json();
        setBillingInfo(data);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading billing information...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
              <p className="text-muted-foreground">
                Manage your subscription and billing information
              </p>
            </div>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment Method
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {billingInfo?.subscription ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Plan</span>
                      <Badge variant="outline">{billingInfo.subscription.plan}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusBadge(billingInfo.subscription.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(billingInfo.subscription.amount, billingInfo.subscription.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Period</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(billingInfo.subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                        {new Date(billingInfo.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No active subscription</p>
                    <Button className="mt-2">Subscribe Now</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {billingInfo?.paymentMethod ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Card</span>
                      <span className="text-sm">
                        {billingInfo.paymentMethod.brand.toUpperCase()} •••• {billingInfo.paymentMethod.last4}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expires</span>
                      <span className="text-sm">
                        {billingInfo.paymentMethod.expiryMonth.toString().padStart(2, '0')}/{billingInfo.paymentMethod.expiryYear}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No payment method on file</p>
                    <Button className="mt-2">Add Payment Method</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingInfo?.invoices && billingInfo.invoices.length > 0 ? (
                <div className="space-y-4">
                  {billingInfo.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">Invoice #{invoice.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
