'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Car, MapPin, User, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface Reservation {
  id: string;
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
  user: {
    name: string;
    email: string;
  };
  lot: {
    name: string;
    address: string;
  };
}

export default function OperatorReservations() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('filter') || 'all');

  useEffect(() => {
    fetchReservations();
  }, [activeTab]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'today' 
        ? '/api/operator/reservations?filter=today'
        : '/api/operator/reservations';
      
      const response = await fetch(url);
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
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

  const formatDateTime = (dateString: string) => {
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

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'CONFIRMED':
        return t('operator.reservationsPage.status.confirmed');
      case 'CHECKED_IN':
        return t('operator.reservationsPage.status.checkedIn');
      case 'CHECKED_OUT':
        return t('operator.reservationsPage.status.checkedOut');
      case 'CANCELLED':
        return t('operator.reservationsPage.status.cancelled');
      case 'NO_SHOW':
        return t('operator.reservationsPage.status.noShow');
      default:
        return state;
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('operator.reservationsPage.title')}</h1>
                    <p className="text-muted-foreground">{t('operator.reservationsPage.description')}</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="today" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('operator.reservationsPage.todaysReservations')}
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {t('operator.reservationsPage.allReservations')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="today" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {t('operator.reservationsPage.todaysReservations')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : reservations.length > 0 ? (
                          <div className="space-y-4">
                            {reservations.map((reservation) => (
                              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{reservation.car.plate}</p>
                                    <Badge variant={getStateBadgeVariant(reservation.state) as any}>
                                      {getStateLabel(reservation.state)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{reservation.lot.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{reservation.user.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                      {t('operator.reservationsPage.arrivalWindow')}: {formatDateTime(reservation.arrivalWindow.start)} - {formatDateTime(reservation.arrivalWindow.end)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{formatCurrency(reservation.fees.reservationFeeAmount)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {t('operator.reservationsPage.createdAt')}: {formatDateTime(reservation.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">{t('operator.reservationsPage.noReservationsToday')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="all" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Filter className="h-5 w-5" />
                          {t('operator.reservationsPage.allReservations')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : reservations.length > 0 ? (
                          <div className="space-y-4">
                            {reservations.map((reservation) => (
                              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{reservation.car.plate}</p>
                                    <Badge variant={getStateBadgeVariant(reservation.state) as any}>
                                      {getStateLabel(reservation.state)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{reservation.lot.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{reservation.user.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                      {t('operator.reservationsPage.arrivalWindow')}: {formatDateTime(reservation.arrivalWindow.start)} - {formatDateTime(reservation.arrivalWindow.end)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{formatCurrency(reservation.fees.reservationFeeAmount)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {t('operator.reservationsPage.createdAt')}: {formatDateTime(reservation.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">{t('operator.reservationsPage.noReservations')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
