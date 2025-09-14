'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, MapPin, Clock, Car, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Reservation {
  _id: string;
  lotId: {
    _id: string;
    name: string;
    location: {
      address: string;
    };
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
      setReservation(data.reservation);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Reservation not found'}</p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🚗 Parcin</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Search
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h1>
          <p className="text-gray-600">Your parking spot has been reserved successfully.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Parking Lot:</span>
                <span className="font-medium">{reservation.lotId.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-xs">{reservation.lotId.location.address}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">License Plate:</span>
                <span className="font-medium">{reservation.car.plate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {reservation.state}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Reservation Fee:</span>
                <span className="font-medium">R$ {reservation.fees.reservationFeeAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Arrival Window */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Arrival Window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">Arrive between:</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">
                    {formatDateTime(reservation.arrivalWindow.start)}
                  </p>
                  <p className="text-blue-700 text-sm">and</p>
                  <p className="font-medium text-blue-900">
                    {formatDateTime(reservation.arrivalWindow.end)}
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Please arrive within this time window to avoid your reservation being marked as no-show.
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
              Check-in QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-gray-100 p-8 rounded-lg inline-block mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                Show this QR code to the parking operator when you arrive.
              </p>
              <p className="text-sm text-gray-500">
                Reservation ID: {reservation._id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button onClick={() => router.push('/')} variant="outline">
            Find More Parking
          </Button>
          <Button onClick={() => window.print()}>
            Print Reservation
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ReservationSuccessContent />
    </Suspense>
  );
}
