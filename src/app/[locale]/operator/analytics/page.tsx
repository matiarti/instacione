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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car, 
  Calendar,
  Clock,
  MapPin,
  Activity
} from 'lucide-react'
import { useTranslations } from 'next-intl';

interface AnalyticsData {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  reservations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  occupancy: {
    average: number;
    peak: number;
    current: number;
  };
  topLots: Array<{
    id: string;
    name: string;
    reservations: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export default function OperatorAnalytics() {
  const t = useTranslations();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 },
    reservations: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 },
    occupancy: { average: 0, peak: 0, current: 0 },
    topLots: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: AnalyticsData = {
        revenue: {
          today: 1250.50,
          thisWeek: 8750.25,
          thisMonth: 32500.75,
          total: 125000.00
        },
        reservations: {
          today: 15,
          thisWeek: 98,
          thisMonth: 425,
          total: 1850
        },
        occupancy: {
          average: 68,
          peak: 95,
          current: 72
        },
        topLots: [
          { id: '1', name: 'Plaza Centro', reservations: 45, revenue: 2250.00 },
          { id: '2', name: 'Shopping Mall', reservations: 38, revenue: 1900.00 },
          { id: '3', name: 'Business District', reservations: 32, revenue: 1600.00 }
        ],
        recentActivity: [
          { id: '1', type: 'reservation', description: 'Nova reserva - Plaza Centro', timestamp: '2024-01-15T10:30:00Z', amount: 25.00 },
          { id: '2', type: 'checkin', description: 'Check-in - Shopping Mall', timestamp: '2024-01-15T10:15:00Z' },
          { id: '3', type: 'checkout', description: 'Check-out - Business District', timestamp: '2024-01-15T09:45:00Z', amount: 15.00 }
        ]
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'checkin':
        return <Clock className="h-4 w-4 text-primary-500" />;
      case 'checkout':
        return <Car className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-500" />;
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
                    <h1 className="text-3xl font-bold tracking-tight">{t('operator.analyticsPage.title')}</h1>
                    <p className="text-muted-foreground">{t('operator.analyticsPage.description')}</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {t('operator.analyticsPage.overview')}
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('operator.analyticsPage.revenue')}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {t('operator.analyticsPage.activity')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.todayRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.today)}</div>
                          <p className="text-xs text-muted-foreground">
                            {t('operator.analyticsPage.revenueToday')}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.todayReservations')}</CardTitle>
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{analytics.reservations.today}</div>
                          <p className="text-xs text-muted-foreground">
                            {t('operator.analyticsPage.reservationsToday')}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.occupancyRate')}</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{analytics.occupancy.current}%</div>
                          <p className="text-xs text-muted-foreground">
                            {t('operator.analyticsPage.currentOccupancy')}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.totalRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</div>
                          <p className="text-xs text-muted-foreground">
                            {t('operator.analyticsPage.allTimeRevenue')}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            {t('operator.analyticsPage.topPerformingLots')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analytics.topLots.length > 0 ? (
                            <div className="space-y-4">
                              {analytics.topLots.map((lot, index) => (
                                <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium">{lot.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {lot.reservations} {t('operator.analyticsPage.reservations')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(lot.revenue)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">{t('operator.analyticsPage.noData')}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            {t('operator.analyticsPage.occupancyStats')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{t('operator.analyticsPage.currentOccupancy')}</span>
                              <span className="font-medium">{analytics.occupancy.current}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{t('operator.analyticsPage.averageOccupancy')}</span>
                              <span className="font-medium">{analytics.occupancy.average}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{t('operator.analyticsPage.peakOccupancy')}</span>
                              <span className="font-medium">{analytics.occupancy.peak}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="revenue" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.todayRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.today)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.weekRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.thisWeek)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.monthRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.thisMonth)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('operator.analyticsPage.totalRevenue')}</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          {t('operator.analyticsPage.recentActivity')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analytics.recentActivity.length > 0 ? (
                          <div className="space-y-4">
                            {analytics.recentActivity.map((activity) => (
                              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                {getActivityIcon(activity.type)}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{activity.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTime(activity.timestamp)}
                                  </p>
                                </div>
                                {activity.amount && (
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{formatCurrency(activity.amount)}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">{t('operator.analyticsPage.noActivity')}</p>
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
