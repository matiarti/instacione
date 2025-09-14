'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, DollarSign, Car, Wifi, Shield, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ParkingLotFormProps {
  className?: string;
  onSuccess?: (lot: any) => void;
  onCancel?: () => void;
}

const getAmenities = (t: any) => [
  { id: '24/7', label: t('operator.addLot.amenity24_7'), icon: Clock },
  { id: 'covered', label: t('operator.addLot.amenityCovered'), icon: Shield },
  { id: 'security', label: t('operator.addLot.amenitySecurity'), icon: Shield },
  { id: 'evCharging', label: t('operator.addLot.amenityEvCharging'), icon: Zap },
  { id: 'wifi', label: t('operator.addLot.amenityWifi'), icon: Wifi },
];

export function ParkingLotForm({
  className,
  onSuccess,
  onCancel,
}: ParkingLotFormProps) {
  const t = useTranslations();
  const amenities = getAmenities(t);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    hourlyRate: '',
    dailyMax: '',
    capacity: '',
    amenities: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Client-side validation
    if (!formData.name.trim()) {
      setMessage('Parking lot name is required');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setMessage('Address is required');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setMessage('Please enter valid latitude and longitude');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (lat < -90 || lat > 90) {
      setMessage('Latitude must be between -90 and 90');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (lng < -180 || lng > 180) {
      setMessage('Longitude must be between -180 and 180');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const hourlyRate = parseFloat(formData.hourlyRate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      setMessage('Please enter a valid hourly rate');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      setMessage('Please enter a valid capacity');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/operator/lots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          hourlyRate: parseFloat(formData.hourlyRate),
          dailyMax: formData.dailyMax ? parseFloat(formData.dailyMax) : undefined,
          capacity: parseInt(formData.capacity),
          amenities: formData.amenities,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to create parking lot');
        setMessageType('error');
      } else {
        setMessage('Parking lot created successfully!');
        setMessageType('success');
        onSuccess?.(data.lot);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('operator.addLot.title')}
        </CardTitle>
        <CardDescription>
          {t('operator.addLot.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('operator.addLot.name')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('operator.addLot.namePlaceholder')}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">{t('operator.addLot.capacity')}</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                placeholder={t('operator.addLot.capacityPlaceholder')}
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('operator.addLot.address')}</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder={t('operator.addLot.addressPlaceholder')}
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">{t('operator.addLot.latitude')}</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="40.7128"
                value={formData.latitude}
                onChange={handleInputChange}
                required
                min="-90"
                max="90"
              />
              <p className="text-xs text-muted-foreground">{t('operator.addLot.latitudeHint')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">{t('operator.addLot.longitude')}</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="-74.0060"
                value={formData.longitude}
                onChange={handleInputChange}
                required
                min="-180"
                max="180"
              />
              <p className="text-xs text-muted-foreground">{t('operator.addLot.longitudeHint')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">{t('operator.addLot.hourlyRate')}</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                placeholder={t('operator.addLot.hourlyRatePlaceholder')}
                value={formData.hourlyRate}
                onChange={handleInputChange}
                required
                min="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyMax">{t('operator.addLot.dailyMax')}</Label>
              <Input
                id="dailyMax"
                name="dailyMax"
                type="number"
                step="0.01"
                placeholder={t('operator.addLot.dailyMaxPlaceholder')}
                value={formData.dailyMax}
                onChange={handleInputChange}
                min="0.01"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t('operator.addLot.amenities')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id}
                      checked={formData.amenities.includes(amenity.id)}
                      onCheckedChange={(checked) =>
                        handleAmenityChange(amenity.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={amenity.id}
                      className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {amenity.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t('operator.addLot.creating') : t('operator.addLot.create')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('operator.addLot.cancel')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
