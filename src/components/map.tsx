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
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.BOTTOM_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        styles: [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.business",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#181818"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1b1b1b"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#2c2c2c"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#8a8a8a"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#373737"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3c3c3c"
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#3d3d3d"
              }
            ]
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
          scaledSize: new (window as any).google.maps.Size(48, 48),
          anchor: new (window as any).google.maps.Point(24, 48),
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
    
    // Create a more sophisticated marker with shadow and better styling
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow -->
        <ellipse cx="24" cy="42" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
        <!-- Main marker body -->
        <path d="M24 4C16.27 4 10 10.27 10 18c0 6.5 4.5 12.5 14 20 9.5-7.5 14-13.5 14-20 0-7.73-6.27-14-14-14z" 
              fill="${selectedColor}" 
              stroke="white" 
              stroke-width="2"/>
        <!-- Inner circle for number -->
        <circle cx="24" cy="20" r="12" fill="white" opacity="0.9"/>
        <!-- Number -->
        <text x="24" y="26" text-anchor="middle" fill="${selectedColor}" 
              font-family="Arial, sans-serif" font-size="14" font-weight="bold">
          ${lot.availability}
        </text>
        <!-- Pulse effect for selected marker -->
        ${selectedLotId === lot.id ? `
          <circle cx="24" cy="20" r="20" fill="none" stroke="${selectedColor}" stroke-width="2" opacity="0.6">
            <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
        ` : ''}
      </svg>
    `)}`;
  };

  const createInfoWindowContent = (lot: ParkingLotMarker): string => {
    const distance = userLocation 
      ? formatDistance(calculateDistance(userLocation, lot.position))
      : null;

    return `
      <div style="padding: 12px; min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #333; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #f9fafb;">${lot.name}</h3>
        <p style="margin: 0 0 10px 0; color: #d1d5db; font-size: 13px; line-height: 1.4;">${lot.address}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #10b981; font-weight: 600; font-size: 14px;">R$ ${lot.hourlyRate.toFixed(2)}/h</span>
          <span style="color: #f9fafb; font-size: 13px; background: #374151; padding: 2px 8px; border-radius: 12px;">${lot.availability}/${lot.capacity} spots</span>
        </div>
        ${distance ? `<p style="margin: 0; color: #d1d5db; font-size: 12px; display: flex; align-items: center; gap: 4px;">📍 ${distance} away</p>` : ''}
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
            <MapPin className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
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
    <>
      <style jsx global>{`
        .gm-style .gm-style-cc {
          background: rgba(31, 41, 55, 0.9) !important;
          color: #d1d5db !important;
        }
        .gm-style .gm-style-cc a {
          color: #d1d5db !important;
        }
        .gm-style .gm-style-cc a:hover {
          color: #f9fafb !important;
        }
        .gm-style .gm-style-mtc {
          background: rgba(31, 41, 55, 0.9) !important;
          border-radius: 8px !important;
          border: 1px solid #374151 !important;
        }
        .gm-style .gm-style-mtc button {
          background: transparent !important;
          color: #d1d5db !important;
          border: none !important;
          padding: 8px 12px !important;
        }
        .gm-style .gm-style-mtc button:hover {
          background: rgba(55, 65, 81, 0.8) !important;
          color: #f9fafb !important;
        }
        .gm-style .gm-style-mtc button[aria-pressed="true"] {
          background: rgba(55, 65, 81, 0.8) !important;
          color: #f9fafb !important;
        }
      `}</style>
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
            className="h-96 w-full rounded-b-lg bg-zinc-100" 
            style={{ minHeight: '384px', minWidth: '100%' }}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 rounded-b-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-zinc-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-zinc-700">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-zinc-200">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-zinc-200">Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-zinc-200">Selected</span>
              </div>
            </div>
          </div>

          {/* Lot Count */}
          <div className="absolute top-4 right-4 bg-zinc-800/90 rounded-lg shadow-lg px-3 py-2 border border-zinc-700">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-zinc-200" />
              <span className="text-zinc-200">{lots.length} lots found</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
