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
import { ParkingLotForm } from "@/components/parking-lot-form"
import { MapPin, Car, DollarSign, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  capacity: number;
  availability: number;
  pricing: {
    hourly: number;
    dailyMax?: number;
  };
  status: string;
  amenities?: string[];
  createdAt: string;
}

export default function OperatorLotsPage() {
  const t = useTranslations();
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await fetch('/api/operator/lots');
      const data = await response.json();
      
      if (response.ok && data.lots) {
        setLots(data.lots);
      } else {
        console.error('Error fetching lots:', data.error || 'Unknown error');
        setLots([]);
      }
    } catch (error) {
      console.error('Error fetching lots:', error);
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLotCreated = (newLot: ParkingLot) => {
    setLots(prev => [newLot, ...prev]);
    setShowAddForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">{t('operator.lots.title')}</h1>
                    <p className="text-muted-foreground">
                      {t('operator.lots.description')}
                    </p>
                  </div>
                  <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('operator.lots.addNew')}
                  </Button>
                </div>

                {showAddForm && (
                  <div className="mb-8">
                    <ParkingLotForm
                      onSuccess={handleLotCreated}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : lots.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lots.map((lot) => (
                      <Card key={lot.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{lot.name}</CardTitle>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                {lot.address}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(lot.status) as any}>
                              {lot.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{lot.availability}/{lot.capacity}</div>
                                <div className="text-xs text-muted-foreground">{t('operator.lots.available')}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{formatCurrency(lot.pricing.hourly)}/hr</div>
                                <div className="text-xs text-muted-foreground">
                                  {lot.pricing.dailyMax ? `Max ${formatCurrency(lot.pricing.dailyMax)}/day` : 'No daily max'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {lot.amenities && lot.amenities.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">{t('operator.lots.amenities')}</div>
                              <div className="flex flex-wrap gap-1">
                                {lot.amenities.slice(0, 3).map((amenity) => (
                                  <Badge key={amenity} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {lot.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{lot.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              {t('operator.lots.view')}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('operator.lots.noLots')}</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        {t('operator.lots.noLotsDescription')}
                      </p>
                      <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {t('operator.lots.addFirst')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
