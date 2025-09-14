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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Car,
  MapPin,
  Star,
  Filter,
  UserPlus
} from 'lucide-react'
import { useTranslations } from 'next-intl';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalReservations: number;
  totalSpent: number;
  lastReservation: string;
  favoriteLots: string[];
  status: 'active' | 'inactive' | 'vip';
  joinDate: string;
  vehicles: Array<{
    plate: string;
    brand: string;
    model: string;
  }>;
}

export default function OperatorCustomers() {
  const t = useTranslations();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: Customer[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '+55 11 99999-9999',
          totalReservations: 25,
          totalSpent: 1250.00,
          lastReservation: '2024-01-15T10:30:00Z',
          favoriteLots: ['Plaza Centro', 'Shopping Mall'],
          status: 'vip',
          joinDate: '2023-06-15T00:00:00Z',
          vehicles: [
            { plate: 'ABC-1234', brand: 'Toyota', model: 'Corolla' },
            { plate: 'XYZ-5678', brand: 'Honda', model: 'Civic' }
          ]
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '+55 11 88888-8888',
          totalReservations: 12,
          totalSpent: 600.00,
          lastReservation: '2024-01-14T15:20:00Z',
          favoriteLots: ['Business District'],
          status: 'active',
          joinDate: '2023-09-20T00:00:00Z',
          vehicles: [
            { plate: 'DEF-9012', brand: 'Volkswagen', model: 'Golf' }
          ]
        },
        {
          id: '3',
          name: 'Pedro Oliveira',
          email: 'pedro.oliveira@email.com',
          totalReservations: 3,
          totalSpent: 150.00,
          lastReservation: '2024-01-10T09:15:00Z',
          favoriteLots: ['Plaza Centro'],
          status: 'inactive',
          joinDate: '2023-12-01T00:00:00Z',
          vehicles: [
            { plate: 'GHI-3456', brand: 'Ford', model: 'Focus' }
          ]
        }
      ];
      setCustomers(mockData);
    } catch (error) {
      console.error('Error fetching customers:', error);
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
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'vip':
        return 'default';
      case 'active':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip':
        return t('operator.customersPage.status.vip');
      case 'active':
        return t('operator.customersPage.status.active');
      case 'inactive':
        return t('operator.customersPage.status.inactive');
      default:
        return status;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && customer.status === activeTab;
  });

  const getCustomerStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const vip = customers.filter(c => c.status === 'vip').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    
    return { total, active, vip, totalRevenue };
  };

  const stats = getCustomerStats();

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
                    <h1 className="text-3xl font-bold tracking-tight">{t('operator.customersPage.title')}</h1>
                    <p className="text-muted-foreground">{t('operator.customersPage.description')}</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.customersPage.totalCustomers')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.customersPage.registeredCustomers')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.customersPage.activeCustomers')}</CardTitle>
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.active}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.customersPage.activeUsers')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.customersPage.vipCustomers')}</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.vip}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.customersPage.vipUsers')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('operator.customersPage.totalRevenue')}</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground">
                        {t('operator.customersPage.fromCustomers')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('operator.customersPage.searchCustomers')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('operator.customersPage.allCustomers')}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t('operator.customersPage.active')}
                    </TabsTrigger>
                    <TabsTrigger value="vip" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t('operator.customersPage.vip')}
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {t('operator.customersPage.inactive')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {t('operator.customersPage.customerList')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          <div className="space-y-4">
                            {filteredCustomers.map((customer) => (
                              <div key={customer.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-medium text-lg">{customer.name}</h3>
                                      <Badge variant={getStatusBadgeVariant(customer.status) as any}>
                                        {getStatusLabel(customer.status)}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {customer.email}
                                      </div>
                                      {customer.phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-4 w-4" />
                                          {customer.phone}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {t('operator.customersPage.memberSince')}: {formatDateTime(customer.joinDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {customer.totalReservations} {t('operator.customersPage.reservations')}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Car className="h-4 w-4" />
                                      {t('operator.customersPage.vehicles')}
                                    </h4>
                                    <div className="space-y-1">
                                      {customer.vehicles.map((vehicle, index) => (
                                        <div key={index} className="text-sm text-muted-foreground">
                                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {t('operator.customersPage.favoriteLots')}
                                    </h4>
                                    <div className="space-y-1">
                                      {customer.favoriteLots.map((lot, index) => (
                                        <div key={index} className="text-sm text-muted-foreground">
                                          {lot}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {t('operator.customersPage.lastReservation')}: {formatDateTime(customer.lastReservation)}
                                    </span>
                                    <Button variant="outline" size="sm">
                                      {t('operator.customersPage.viewDetails')}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">{t('operator.customersPage.noCustomers')}</p>
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
