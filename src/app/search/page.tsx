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
import { 
  type ParkingLotMarker, 
  type Location,
  getCurrentLocation,
  geocodeAddress,
  sortLotsByDistance,
  filterLots
} from '@/lib/maps';

export default function SearchPage() {
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
    maxPrice: 50, // R$
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
  }, [parkingLots, userLocation, filters]);

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lots');
      if (!response.ok) throw new Error('Failed to fetch lots');
      
      const data = await response.json();
      const lots: ParkingLotMarker[] = data.lots.map((lot: any) => ({
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
        setParkingLots(lotsWithDistance);
      } else {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <a href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </a>
              </Button>
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Parcin</h1>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="/operator">Operator Dashboard</a>
              </Button>
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Parking</CardTitle>
            <CardDescription>
              Search for parking lots near your destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Where are you going?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={userLocation ? "Location detected" : "Current location"}
                    value={userLocation ? "📍 Current location detected" : ""}
                    disabled
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Distance: {filters.maxDistance}km
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Price: {formatCurrency(filters.maxPrice)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Availability: {filters.minAvailability}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities
                      </label>
                      <div className="space-y-2">
                        {['24/7', 'Covered', 'Security', 'EV Charging'].map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={filters.amenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <label htmlFor={amenity} className="text-sm">
                              {amenity}
                            </label>
                          </div>
                        ))}
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
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredLots.length} Parking Lots Found
            </h2>
            <p className="text-gray-600">
              {userLocation ? 'Sorted by distance from your location' : 'Showing all available lots'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <Car className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Map
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
                      <div className="flex items-center justify-between text-sm text-gray-600">
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
                          lot.availability > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lot.availability > 0 ? 'Available' : 'Full'}
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
                          <span className="flex items-center gap-1 text-gray-600">
                            <Navigation className="h-3 w-3" />
                            {formatDistance(lot.distance)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          {lot.availability}/{lot.capacity}
                        </span>
                      </div>
                      <div className={`font-medium ${
                        lot.availability > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {lot.availability > 0 ? 'Available' : 'Full'}
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
                      Reserve Spot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}