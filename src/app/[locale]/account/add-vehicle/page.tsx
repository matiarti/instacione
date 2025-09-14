'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VehicleForm from '../../../../components/vehicle-form';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { CheckCircle, ArrowLeft, Car } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import Link from 'next/link';

interface VehicleFormData {
  plate: string;
  color: string;
  brand?: string;
  model?: string;
  modelVersion?: string;
  manufacturingYear?: number;
  modelYear?: number;
  numberOfDoors?: number;
  fuelType?: string;
  accessoryPackage?: string;
  estimatedValue?: number;
}

export default function AddVehiclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/user/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to account page after 2 seconds
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setError(result.error || t('vehicle.saveError'));
      }
    } catch (error) {
      setError(t('vehicle.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('vehicle.addedSuccessfully')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/account">{t('account.profile')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('vehicle.addVehicle')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('vehicle.addVehicle')}</h1>
              <p className="text-muted-foreground">
                {t('vehicle.addVehicleDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/account">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('vehicle.backToAccount')}
              </Link>
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Vehicle Form */}
          <VehicleForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
