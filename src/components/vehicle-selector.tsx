'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Car, Plus, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  brand: string;
  modelVersion?: string;
  manufacturingYear?: number;
  modelYear?: number;
  numberOfDoors?: number;
  fuelType?: string;
  accessoryPackage?: string;
  estimatedValue?: number;
  isDefault: boolean;
}

interface VehicleSelectorProps {
  selectedVehicleId?: string;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  showAddNew?: boolean;
  className?: string;
}

export default function VehicleSelector({ 
  selectedVehicleId, 
  onVehicleSelect, 
  showAddNew = true,
  className = ""
}: VehicleSelectorProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchVehicles();
    }
  }, [session]);

  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        onVehicleSelect(vehicle);
      }
    } else if (vehicles.length > 0 && !selectedVehicleId) {
      // Auto-select default vehicle if no selection
      const defaultVehicle = vehicles.find(v => v.isDefault);
      if (defaultVehicle) {
        setSelectedVehicle(defaultVehicle);
        onVehicleSelect(defaultVehicle);
      }
    }
  }, [selectedVehicleId, vehicles, onVehicleSelect]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/user/vehicles');
      const data = await response.json();
      
      if (data.success) {
        setVehicles(data.vehicles);
      } else {
        setError(t('vehicle.loadError'));
      }
    } catch (error) {
      setError(t('vehicle.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    onVehicleSelect(vehicle);
  };

  const handleManualPlate = (plate: string) => {
    if (plate.trim()) {
      const manualVehicle: Vehicle = {
        id: 'manual',
        plate: plate.toUpperCase(),
        model: '',
        color: '',
        brand: '',
        isDefault: false,
      };
      setSelectedVehicle(manualVehicle);
      onVehicleSelect(manualVehicle);
    } else {
      setSelectedVehicle(null);
      onVehicleSelect(null);
    }
  };

  if (!session?.user?.email) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t('lot.licensePlate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="manualPlate">{t('lot.licensePlate')}</Label>
              <Input
                id="manualPlate"
                placeholder="ABC-1234"
                onChange={(e) => handleManualPlate(e.target.value)}
                className="uppercase"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t('lot.licensePlate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t('lot.licensePlate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {t('lot.licensePlate')}
          </CardTitle>
          <CardDescription>
            {vehicles.length > 0 
              ? t('vehicle.selector.selectVehicle') 
              : t('vehicle.selector.noVehicles')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicles.length > 0 && (
            <div className="space-y-2">
              <Label>{t('vehicle.selector.myVehicles')}</Label>
              <div className="grid gap-2">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleVehicleSelect(vehicle)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vehicle.plate}</span>
                          {vehicle.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              {t('vehicle.selector.default')}
                            </Badge>
                          )}
                          {selectedVehicle?.id === vehicle.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        {vehicle.brand && vehicle.model && (
                          <p className="text-sm text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                            {vehicle.color && ` • ${vehicle.color}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="manualPlate">
              {vehicles.length > 0 
                ? t('vehicle.selector.orEnterManually') 
                : t('lot.licensePlate')
              }
            </Label>
            <Input
              id="manualPlate"
              placeholder="ABC-1234"
              onChange={(e) => handleManualPlate(e.target.value)}
              className="uppercase"
              value={selectedVehicle?.id === 'manual' ? selectedVehicle.plate : ''}
            />
          </div>

          {showAddNew && (
            <div className="pt-2">
              <Link href="/account/add-vehicle">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('vehicle.selector.addNewVehicle')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
