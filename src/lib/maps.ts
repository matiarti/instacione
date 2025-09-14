import { Loader } from '@googlemaps/js-api-loader';

// Initialize Google Maps
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface ParkingLotMarker {
  id: string;
  position: Location;
  name: string;
  address: string;
  hourlyRate: number;
  availability: number;
  capacity: number;
  amenities?: string[];
  distance?: number; // Distance from user location in km
}

// Initialize Google Maps
export async function initializeGoogleMaps(): Promise<typeof google> {
  try {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }
    
    console.log('Loading Google Maps with API key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');
    
    return await loader.load();
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Google Maps API key is invalid or missing');
      } else if (error.message.includes('quota')) {
        throw new Error('Google Maps API quota exceeded');
      } else if (error.message.includes('blocked') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Google Maps is being blocked. Please disable ad blockers, browser extensions, or try in incognito mode.');
      }
    }
    
    throw new Error('Failed to load Google Maps. Please check your internet connection and try again.');
  }
}

// Geocoding: Convert address to coordinates
export async function geocodeAddress(address: string): Promise<Location | null> {
  try {
    const google = await initializeGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address,
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
}

// Reverse Geocoding: Convert coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const google = await initializeGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

// Calculate distance between two points (in kilometers)
export function calculateDistance(
  point1: Location,
  point2: Location,
  unit: 'km' | 'miles' = 'km'
): number {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get user's current location
export async function getCurrentLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // Only log detailed errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error getting location:', error);
        }
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Format distance for display
export function formatDistance(distance: number, unit: 'km' | 'miles' = 'km'): string {
  if (unit === 'km') {
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  } else {
    return distance < 1
      ? `${Math.round(distance * 5280)}ft`
      : `${distance.toFixed(1)}mi`;
  }
}

// Create map bounds from parking lots
export function createBoundsFromLots(lots: ParkingLotMarker[]): any | null {
  if (lots.length === 0) return null;
  
  const bounds = new (window as any).google.maps.LatLngBounds();
  lots.forEach(lot => {
    bounds.extend(new (window as any).google.maps.LatLng(lot.position.lat, lot.position.lng));
  });
  
  return bounds;
}

// Sort parking lots by distance
export function sortLotsByDistance(
  lots: ParkingLotMarker[],
  userLocation: Location
): ParkingLotMarker[] {
  return lots
    .map(lot => ({
      ...lot,
      distance: calculateDistance(userLocation, lot.position),
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Filter parking lots by criteria
export function filterLots(
  lots: ParkingLotMarker[],
  filters: {
    maxDistance?: number; // in km
    maxPrice?: number;
    minAvailability?: number;
    amenities?: string[];
  }
): ParkingLotMarker[] {
  return lots.filter(lot => {
    if (filters.maxDistance && lot.distance && lot.distance > filters.maxDistance) {
      return false;
    }
    
    if (filters.maxPrice && lot.hourlyRate > filters.maxPrice) {
      return false;
    }
    
    if (filters.minAvailability && lot.availability < filters.minAvailability) {
      return false;
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      const hasRequiredAmenities = filters.amenities.every(amenity =>
        lot.amenities?.includes(amenity)
      );
      if (!hasRequiredAmenities) return false;
    }
    
    return true;
  });
}

// Get directions between two points
export async function getDirections(
  origin: Location,
  destination: Location
): Promise<google.maps.DirectionsResult | null> {
  try {
    const google = await initializeGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            console.error('Directions request failed:', status);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
}
