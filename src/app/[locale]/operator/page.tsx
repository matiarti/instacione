'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Car, DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface DashboardStats {
  totalLots: number;
  totalSpots: number;
  todayReservations: number;
  todayRevenue: number;
}

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

export default function OperatorDashboard() {
  const t = useTranslations();
  const [stats, setStats] = useState<DashboardStats>({
    totalLots: 0,
    totalSpots: 0,
    todayReservations: 0,
    todayRevenue: 0,
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch lots data
      const lotsResponse = await fetch('/api/operator/lots');
      const lotsData = await lotsResponse.json();
      
      // Fetch recent reservations
      const reservationsResponse = await fetch('/api/operator/reservations?limit=10');
      const reservationsData = await reservationsResponse.json();
      
      // Calculate stats
      const totalSpots = lotsData.lots.reduce((sum: number, lot: any) => sum + lot.capacity, 0);
      const todayReservations = reservationsData.reservations.length;
      const todayRevenue = reservationsData.reservations.reduce(
        (sum: number, res: any) => sum + res.fees.reservationFeeAmount, 0
      );
      
      setStats({
        totalLots: lotsData.lots.length,
        totalSpots,
        todayReservations,
        todayRevenue,
      });
      
      setReservations(reservationsData.reservations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.dashboard.totalLots')}</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalLots}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.dashboard.activeParkingLots')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.dashboard.totalSpots')}</CardTitle>
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSpots}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.dashboard.availableParkingSpots')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.dashboard.todayReservations')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.todayReservations}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.dashboard.activeReservations')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.dashboard.revenue')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.dashboard.todayEarnings')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('operator.dashboard.recentReservations')}</CardTitle>
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
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{reservation.car.plate}</p>
                                <Badge variant={getStateBadgeVariant(reservation.state) as any}>
                                  {reservation.state.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{reservation.lot.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {reservation.user.name} • {formatDateTime(reservation.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(reservation.fees.reservationFeeAmount)}</p>
                              <p className="text-xs text-muted-foreground">
                                Arrival: {formatDateTime(reservation.arrivalWindow.start)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">{t('operator.dashboard.noReservations')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
