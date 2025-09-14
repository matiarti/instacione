'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Star, Navigation, Car, DollarSign, Users, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Map from '@/components/map';
import { AuthHeader } from '@/components/auth-header';
import { useTranslations } from 'next-intl';
import { 
  type ParkingLotMarker, 
  type Location,
  getCurrentLocation,
  geocodeAddress,
  sortLotsByDistance,
  filterLots
} from '@/lib/maps';

export default function SearchPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLotMarker[]>([]);
  const [filteredLots, setFilteredLots] = useState<ParkingLotMarker[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLotMarker | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  // Filters
  const [filters, setFilters] = useState({
    maxDistance: 5, // km
    maxPrice: 150, // R$ - Increased to show expensive lots
    minAvailability: 1,
    amenities: [] as string[],
  });

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation().then(location => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, []);

  // Load parking lots
  useEffect(() => {
    loadParkingLots();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [parkingLots, userLocation, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lots?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch lots');
      
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Data length:', data.length);
      
      const lots: ParkingLotMarker[] = data.map((lot: any) => ({
        id: lot._id,
        position: {
          lat: lot.location.geo.coordinates[1],
          lng: lot.location.geo.coordinates[0],
        },
        name: lot.name,
        address: lot.location.address,
        hourlyRate: lot.pricing.hourly,
        availability: lot.availabilityManual,
        capacity: lot.capacity,
        amenities: lot.amenities || [],
      }));

      // Add distance if user location is available
      if (userLocation) {
        const lotsWithDistance = sortLotsByDistance(lots, userLocation);
        console.log('Lots with distance:', lotsWithDistance);
        setParkingLots(lotsWithDistance);
      } else {
        console.log('Lots without distance:', lots);
        setParkingLots(lots);
      }
    } catch (error) {
      console.error('Error loading parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...parkingLots];

    if (userLocation) {
      // Sort by distance first
      filtered = sortLotsByDistance(filtered, userLocation);
    }

    // Apply filters
    filtered = filterLots(filtered, {
      maxDistance: filters.maxDistance,
      maxPrice: filters.maxPrice,
      minAvailability: filters.minAvailability,
      amenities: filters.amenities,
    });

    setFilteredLots(filtered);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const location = await geocodeAddress(searchQuery);
      if (location) {
        // TODO: Search for parking lots near the searched location
        console.log('Searching near:', location);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLotSelect = (lot: ParkingLotMarker) => {
    setSelectedLot(lot);
  };

  const handleLocationUpdate = (location: Location) => {
    setUserLocation(location);
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDistance = (distance: number) => {
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </a>
          </Button>
          <h1 className="text-2xl font-bold">{t('search.title')}</h1>
        </div>
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('search.title')}</CardTitle>
            <CardDescription>
              {t('search.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('search.destinationPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={userLocation ? t('search.locationDetected') : t('search.currentLocation')}
                    value={userLocation ? "📍 Current location detected" : ""}
                    disabled
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? t('search.searching') : t('common.search')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('search.filters.maxDistance')}: {filters.maxDistance}km
                      </label>
                      <Slider
                        value={[filters.maxDistance]}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                        max={10}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('search.filters.maxPrice')}: {formatCurrency(filters.maxPrice)}
                      </label>
                      <Slider
                        value={[filters.maxPrice]}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value[0] }))}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('search.filters.minAvailability')}: {filters.minAvailability}
                      </label>
                      <Slider
                        value={[filters.minAvailability]}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, minAvailability: value[0] }))}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('search.filters.amenities')}
                      </label>
                      <div className="space-y-2">
                        {['24/7', 'Covered', 'Security', 'EV Charging'].map(amenity => {
                          const amenityKey = amenity === '24/7' ? '24/7' : 
                                           amenity === 'EV Charging' ? 'evCharging' : 
                                           amenity.toLowerCase();
                          return (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={filters.amenities.includes(amenity)}
                                onCheckedChange={() => toggleAmenity(amenity)}
                              />
                              <label htmlFor={amenity} className="text-sm">
                                {t(`search.amenities.${amenityKey}` as any)}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {t('search.results.title', { count: filteredLots.length })}
            </h2>
            <p className="text-muted-foreground">
              {userLocation ? t('search.results.sortedByDistance') : t('search.results.showingAll')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <Car className="h-4 w-4 mr-2" />
              {t('search.results.listView')}
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {t('search.results.mapView')}
            </Button>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Parking Lots List */}
            <div className="lg:col-span-1">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredLots.map((lot) => (
                  <Card 
                    key={lot.id} 
                    className={`cursor-pointer transition-all ${
                      selectedLot?.id === lot.id 
                        ? 'ring-2 ring-blue-500 shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleLotSelect(lot)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{lot.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {lot.address}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {formatCurrency(lot.hourlyRate)}/h
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {lot.distance && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {formatDistance(lot.distance)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lot.availability}/{lot.capacity}
                          </span>
                        </div>
                        <div className={`font-medium ${
                          lot.availability > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {lot.availability > 0 ? t('common.available') : t('common.full')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <Map
                lots={filteredLots}
                userLocation={userLocation}
                selectedLotId={selectedLot?.id}
                onLotSelect={handleLotSelect}
                onLocationUpdate={handleLocationUpdate}
                className="h-full"
              />
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map((lot) => (
              <Card 
                key={lot.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.location.href = `/lot/${lot.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{lot.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {lot.address}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {formatCurrency(lot.hourlyRate)}/h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          {lot.distance && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Navigation className="h-3 w-3" />
                              {formatDistance(lot.distance)}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {lot.availability}/{lot.capacity}
                          </span>
                        </div>
                        <div className={`font-medium ${
                          lot.availability > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {lot.availability > 0 ? t('common.available') : t('common.full')}
                        </div>
                      </div>
                    
                    {lot.amenities && lot.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lot.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button className="w-full" size="sm">
                      {t('common.reserveSpot')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}