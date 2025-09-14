'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Car, DollarSign, Users } from 'lucide-react';
import { 
  initializeGoogleMaps, 
  type ParkingLotMarker, 
  type Location,
  calculateDistance,
  formatDistance,
  sortLotsByDistance
} from '@/lib/maps';

interface MapProps {
  lots: ParkingLotMarker[];
  userLocation?: Location | null;
  selectedLotId?: string;
  onLotSelect: (lot: ParkingLotMarker) => void;
  onLocationUpdate?: (location: Location) => void;
  className?: string;
}

export default function Map({
  lots,
  userLocation,
  selectedLotId,
  onLotSelect,
  onLocationUpdate,
  className = '',
}: MapProps) {
  console.log('Map component rendered with lots:', lots.length);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Callback ref to initialize map when DOM element is ready
  const setMapRef = (element: HTMLDivElement | null) => {
    console.log('setMapRef called with:', element);
    if (element && !mapInstanceRef.current) {
      console.log('Map DOM element is ready, initializing map...');
      console.log('Element dimensions:', {
        width: element.offsetWidth,
        height: element.offsetHeight,
        visible: element.offsetParent !== null
      });
      // Small delay to ensure element is fully mounted
      setTimeout(() => {
        initializeMap(element);
      }, 50);
    }
  };

  // Remove the useEffect - we'll use callback ref only

  // Update markers when lots change
  useEffect(() => {
    if (mapInstanceRef.current && lots.length > 0) {
      updateMarkers();
    }
  }, [lots, selectedLotId, userLocation]);

  // Update map bounds when lots change
  useEffect(() => {
    if (mapInstanceRef.current && lots.length > 0) {
      fitMapToLots();
    }
  }, [lots]);

  const initializeMap = async (element?: HTMLDivElement) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Initializing Google Maps...');
      const google = await initializeGoogleMaps();
      console.log('Google Maps loaded successfully:', google);
      
      const mapElement = element || mapRef.current;
      if (!mapElement) {
        console.error('Map element is null');
        return;
      }
      console.log('Map element found, creating map instance...');

      // Default center (São Paulo, Brazil)
      const defaultCenter = { lat: -23.5505, lng: -46.6333 };
      
      mapInstanceRef.current = new google.maps.Map(mapElement, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      console.log('Map instance created successfully');

      // Add click listener to map
      mapInstanceRef.current.addListener('click', (event: any) => {
        if (event.latLng) {
          const location: Location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          onLocationUpdate?.(location);
        }
      });

      console.log('Map initialization complete');
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
      setIsLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    lots.forEach(lot => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: lot.position.lat, lng: lot.position.lng },
        map: mapInstanceRef.current,
        title: lot.name,
        icon: {
          url: createMarkerIcon(lot),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 40),
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        onLotSelect(lot);
      });

      // Add info window
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: createInfoWindowContent(lot),
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const fitMapToLots = () => {
    if (!mapInstanceRef.current || lots.length === 0) return;

    const bounds = new (window as any).google.maps.LatLngBounds();
    
    lots.forEach(lot => {
      bounds.extend(new (window as any).google.maps.LatLng(lot.position.lat, lot.position.lng));
    });

    // Include user location in bounds if available
    if (userLocation) {
      bounds.extend(new (window as any).google.maps.LatLng(userLocation.lat, userLocation.lng));
    }

    mapInstanceRef.current.fitBounds(bounds);
    
    // Ensure minimum zoom level
    const listener = (window as any).google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
      if (mapInstanceRef.current!.getZoom()! > 15) {
        mapInstanceRef.current!.setZoom(15);
      }
      (window as any).google.maps.event.removeListener(listener);
    });
  };

  const createMarkerIcon = (lot: ParkingLotMarker): string => {
    const availabilityColor = lot.availability > 0 ? '#10b981' : '#ef4444'; // green or red
    const selectedColor = selectedLotId === lot.id ? '#3b82f6' : availabilityColor; // blue if selected
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${selectedColor}" stroke="white" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
          ${lot.availability}
        </text>
      </svg>
    `)}`;
  };

  const createInfoWindowContent = (lot: ParkingLotMarker): string => {
    const distance = userLocation 
      ? formatDistance(calculateDistance(userLocation, lot.position))
      : null;

    return `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${lot.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${lot.address}</p>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #059669; font-weight: bold;">R$ ${lot.hourlyRate.toFixed(2)}/h</span>
          <span style="color: #666;">${lot.availability}/${lot.capacity} spots</span>
        </div>
        ${distance ? `<p style="margin: 0; color: #666; font-size: 12px;">📍 ${distance} away</p>` : ''}
      </div>
    `;
  };

  const centerOnUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter({
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Always render the map container, show loading overlay when needed

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={() => initializeMap()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Parking Map
          </CardTitle>
          {userLocation && (
            <Button
              onClick={centerOnUserLocation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              My Location
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div 
            ref={setMapRef} 
            className="h-96 w-full rounded-b-lg bg-gray-100" 
            style={{ minHeight: '384px', minWidth: '100%' }}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-b-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Lot Count */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4" />
              <span>{lots.length} lots found</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
