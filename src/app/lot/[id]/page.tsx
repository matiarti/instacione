'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PaymentFormWrapper from '@/components/payment-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { AuthHeader } from '@/components/auth-header';

interface ParkingLot {
  _id: string;
  name: string;
  location: {
    address: string;
    geo: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  pricing: {
    hourly: number;
    dailyMax?: number;
  };
  capacity: number;
  availabilityManual: number;
  amenities?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export default function LotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [lot, setLot] = useState<ParkingLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationData, setReservationData] = useState({
    carPlate: '',
    expectedHours: 2,
    arrivalTime: ''
  });
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    fetchLotDetails();
  }, [params.id]);

  const fetchLotDetails = async () => {
    try {
      const response = await fetch(`/api/lots/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lot details');
      }
      const data = await response.json();
      setLot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservationLoading(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: params.id,
          carPlate: reservationData.carPlate,
          expectedHours: reservationData.expectedHours,
          arrivalTime: reservationData.arrivalTime || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const result = await response.json();
      setReservationId(result.reservation.id);
      setShowPaymentForm(true);
      setShowReservationForm(false);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setReservationLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push(`/reservation/success?reservation=${reservationId}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading parking lot details...</p>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Parking lot not found'}</p>
          <a href="/" className="text-primary hover:text-primary/80">
            ← Back to search
          </a>
        </div>
      </div>
    );
  }

  const reservationFee = lot.pricing.hourly * 0.12; // 12% reservation fee

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-6">
          <a href="/" className="text-primary hover:text-primary/80 mr-4">← Back</a>
          <h1 className="text-2xl font-bold">Parking Lot Details</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lot Details */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-4">{lot.name}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{lot.location.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Pricing</p>
                    <p className="text-muted-foreground">R$ {lot.pricing.hourly.toFixed(2)} per hour</p>
                    {lot.pricing.dailyMax && (
                      <p className="text-muted-foreground">Daily max: R$ {lot.pricing.dailyMax.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Availability</p>
                    <p className="text-muted-foreground">{lot.availabilityManual} spots available out of {lot.capacity}</p>
                  </div>
                </div>

                {lot.amenities && lot.amenities.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {lot.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Reserve Your Spot</h3>
              
              {/* Payment Success Message */}
              {paymentSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="ml-2">
                    Payment successful! Redirecting to confirmation page...
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Error Message */}
              {paymentError && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="ml-2">
                    {paymentError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Form */}
              {showPaymentForm && reservationId && lot && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Complete Payment</h4>
                  <PaymentFormWrapper
                    reservationId={reservationId}
                    amount={lot.pricing.hourly * 0.12}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              )}

              {!showReservationForm && !showPaymentForm ? (
                <div>
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-2">Reservation Fee:</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {reservationFee.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">(12% of first hour)</p>
                  </div>
                  
                  <button
                    onClick={() => setShowReservationForm(true)}
                    className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
                  >
                    Reserve Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="carPlate" className="block text-sm font-medium mb-1">
                      License Plate
                    </label>
                    <input
                      type="text"
                      id="carPlate"
                      value={reservationData.carPlate}
                      onChange={(e) => setReservationData({ ...reservationData, carPlate: e.target.value.toUpperCase() })}
                      placeholder="ABC-1234"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="expectedHours" className="block text-sm font-medium mb-1">
                      Expected Hours
                    </label>
                    <select
                      id="expectedHours"
                      value={reservationData.expectedHours}
                      onChange={(e) => setReservationData({ ...reservationData, expectedHours: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={8}>8 hours</option>
                      <option value={24}>24 hours</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="arrivalTime" className="block text-sm font-medium mb-1">
                      Arrival Time (optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="arrivalTime"
                      value={reservationData.arrivalTime}
                      onChange={(e) => setReservationData({ ...reservationData, arrivalTime: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reservation Fee:</span>
                      <span>R$ {reservationFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Est. Total ({reservationData.expectedHours}h):</span>
                      <span>R$ {(lot.pricing.hourly * reservationData.expectedHours).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Due Now:</span>
                      <span>R$ {reservationFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReservationForm(false)}
                      className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 focus:outline-hidden focus:ring-2 focus:ring-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reservationLoading}
                      className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {reservationLoading ? 'Creating...' : 'Confirm'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
