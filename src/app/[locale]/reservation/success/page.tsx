'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, MapPin, Clock, Car, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { useTranslations } from 'next-intl';

interface Reservation {
  id: string;
  lot: {
    id: string;
    name: string;
    address: string;
    hourlyRate: number;
  };
  state: string;
  arrivalWindow: {
    start: string;
    end: string;
  };
  car: {
    plate: string;
  };
  fees: {
    reservationFeeAmount: number;
  };
  createdAt: string;
}

function ReservationSuccessContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reservationId = searchParams.get('reservation');

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    } else {
      setError('No reservation ID provided');
      setLoading(false);
    }
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reservation details');
      }
      const data = await response.json();
      // The API returns the reservation data directly, not wrapped in a 'reservation' property
      setReservation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reservation');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('reservation.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || t('reservation.notFound')}</p>
          <Button onClick={() => router.push('/')}>
            {t('reservation.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Logo width={160} height={32} />
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              {t('reservation.backToSearch')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('reservation.confirmed')}</h1>
          <p className="text-muted-foreground">{t('reservation.confirmedDescription')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {t('reservation.details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reservation.parkingLot')}:</span>
                <span className="font-medium">{reservation.lot.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reservation.address')}:</span>
                <span className="font-medium text-right max-w-xs">{reservation.lot.address}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reservation.licensePlate')}:</span>
                <span className="font-medium">{reservation.car.plate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reservation.status')}:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {reservation.state}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reservation.reservationFee')}:</span>
                <span className="font-medium">R$ {reservation.fees.reservationFeeAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Arrival Window */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {t('reservation.arrivalWindow')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2">{t('reservation.arriveBetween')}:</p>
                <div className="bg-primary-50 dark:bg-primary-950 p-4 rounded-lg">
                  <p className="font-medium text-primary-900 dark:text-primary-100">
                    {formatDateTime(reservation.arrivalWindow.start)}
                  </p>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">{t('reservation.and')}</p>
                  <p className="font-medium text-primary-900 dark:text-primary-100">
                    {formatDateTime(reservation.arrivalWindow.end)}
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>{t('reservation.important')}:</strong> {t('reservation.importantMessage')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              {t('reservation.checkinQrCode')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-muted p-8 rounded-lg inline-block mb-4">
                <QrCode className="w-24 h-24 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                {t('reservation.showQrCode')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('reservation.reservationId')}: {reservation.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button onClick={() => router.push('/')} variant="outline">
            {t('reservation.findMoreParking')}
          </Button>
          <Button onClick={() => window.print()}>
            {t('reservation.printReservation')}
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ReservationSuccessContent />
    </Suspense>
  );
}
