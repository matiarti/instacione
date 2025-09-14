'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Car, MapPin, Clock, DollarSign, Settings, User, CreditCard, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthHeader } from '@/components/auth-header';

interface Vehicle {
  id: string;
  plate: string;
  model?: string;
  color?: string;
  isDefault: boolean;
}

interface Reservation {
  id: string;
  lotName: string;
  lotAddress: string;
  state: string;
  arrivalWindow: {
    start: string;
    end: string;
  };
  carPlate: string;
  fees: {
    reservationFeeAmount: number;
  };
  createdAt: string;
  checkinAt?: string;
  checkoutAt?: string;
}

export default function AccountPage() {
  const session = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session.status === 'loading') return;
    if (!session.data) {
      router.push('/auth/signin');
      return;
    }
    
    fetchUserData();
  }, [session.data, session.status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (!session.data?.user?.email) return;
      
      // Fetch user's vehicles and reservations in parallel
      const [vehiclesResponse, reservationsResponse] = await Promise.all([
        fetch('/api/user/vehicles'),
        fetch('/api/user/reservations'),
      ]);

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setVehicles(vehiclesData.vehicles || []);
      }

      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'CONFIRMED':
        return 'default';
      case 'CHECKED_IN':
        return 'secondary';
      case 'CHECKED_OUT':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      case 'NO_SHOW':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {session.data?.user?.name}!
          </h2>
          <p className="text-muted-foreground">
            Manage your vehicles, view reservation history, and update your preferences.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservations.length}</div>
              <p className="text-xs text-muted-foreground">
                All time reservations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reservations.filter(r => ['CONFIRMED', 'CHECKED_IN'].includes(r.state)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-muted-foreground">
                Vehicles in account
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  reservations.reduce((sum, r) => sum + r.fees.reservationFeeAmount, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Reservation fees paid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservation History</CardTitle>
                <CardDescription>
                  View and manage your parking reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reservations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by searching for parking lots near your destination.
                    </p>
                    <Button asChild>
                      <a href="/search">Find Parking</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{reservation.lotName}</h3>
                                <Badge variant={getStateBadgeVariant(reservation.state) as any}>
                                  {reservation.state.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{reservation.lotAddress}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Vehicle:</span>
                                  <p className="font-medium">{reservation.carPlate}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Arrival:</span>
                                  <p className="font-medium">{formatDate(reservation.arrivalWindow.start)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Amount:</span>
                                  <p className="font-medium">{formatCurrency(reservation.fees.reservationFeeAmount)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Booked:</span>
                                  <p className="font-medium">{formatDate(reservation.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              {reservation.state === 'CONFIRMED' && (
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              )}
                              {reservation.state === 'CHECKED_OUT' && (
                                <Button size="sm" variant="outline">
                                  Rate Experience
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Vehicles</CardTitle>
                    <CardDescription>
                      Manage your registered vehicles for faster reservations
                    </CardDescription>
                  </div>
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No vehicles registered</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your vehicles to make reservations faster.
                    </p>
                    <Button>
                      <Car className="h-4 w-4 mr-2" />
                      Add Your First Vehicle
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                                {vehicle.isDefault && (
                                  <Badge variant="default">Default</Badge>
                                )}
                              </div>
                              {vehicle.model && (
                                <p className="text-muted-foreground text-sm">{vehicle.model}</p>
                              )}
                              {vehicle.color && (
                                <p className="text-muted-foreground text-xs">{vehicle.color}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              {!vehicle.isDefault && (
                                <Button size="sm" variant="outline">
                                  Set Default
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={session.data?.user?.name || ''}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={session.data?.user?.email || ''}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your reservations</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Get text messages for important updates</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-select Default Vehicle</p>
                        <p className="text-sm text-muted-foreground">Automatically use your default vehicle for reservations</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button>Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
