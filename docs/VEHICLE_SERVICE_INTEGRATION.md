# 🚗 Vehicle Service Integration

This document describes the vehicle data integration using the [fetchicles package](https://www.npmjs.com/package/fetchicles) for vehicle brand and model information in the Parking Hub application.

## Overview

The vehicle service integration allows users to:
- Select from comprehensive lists of vehicle brands (cars and motorcycles)
- Get detailed model information for any brand
- Choose between different vehicle types (CAR or MOTORCYCLE)
- Validate brand and model combinations
- Add vehicles to their account for faster reservations

## Why Fetticles?

We chose [fetchicles](https://www.npmjs.com/package/fetchicles) over other solutions because:

- ✅ **No Authentication Required** - Works out of the box without API keys
- ✅ **Comprehensive Data** - Covers brands and models from around the world
- ✅ **Simple API** - Easy to use with clear documentation
- ✅ **Lightweight** - Small package size with minimal dependencies
- ✅ **TypeScript Support** - Built-in type declarations
- ✅ **Reliable** - Well-maintained package with good community support

## API Endpoints

### 1. Get Vehicle Brands
**Endpoint:** `GET /api/vehicles/brands?type={type}`

Returns a list of vehicle brands for the specified vehicle type.

**Parameters:**
- `type` (optional): `CAR` or `MOTORCYCLE` (defaults to `CAR`)

**Example:**
```bash
curl "http://localhost:3000/api/vehicles/brands?type=CAR"
curl "http://localhost:3000/api/vehicles/brands?type=MOTORCYCLE"
```

**Response:**
```json
{
  "success": true,
  "brands": ["Ford", "Chevrolet", "Fiat", "Citroen", "Honda", "Hyundai", "Renault", "Toyota", "Volkswagen"]
}
```

### 2. Get Vehicle Models
**Endpoint:** `GET /api/vehicles/models?brand={brand}&type={type}`

Returns detailed model information for a specific brand and vehicle type.

**Parameters:**
- `brand` (required): Brand name (case insensitive)
- `type` (optional): `CAR` or `MOTORCYCLE` (defaults to `CAR`)

**Example:**
```bash
curl "http://localhost:3000/api/vehicles/models?brand=Ford&type=CAR"
curl "http://localhost:3000/api/vehicles/models?brand=Honda&type=MOTORCYCLE"
```

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "model": "Fiesta",
      "modelVersion": "Fiesta",
      "numberOfDoors": 4,
      "fuelType": "Gasolina",
      "accessoryPackage": "Básico"
    },
    {
      "model": "Focus",
      "modelVersion": "Focus",
      "numberOfDoors": 4,
      "fuelType": "Gasolina",
      "accessoryPackage": "Básico"
    }
  ]
}
```

### 3. Get Vehicle by Plate
**Endpoint:** `GET /api/vehicles/plate?plate={plate}`

**Note:** Since fetchicles doesn't support plate lookup, this endpoint returns a message directing users to select brand and model manually.

**Example:**
```bash
curl "http://localhost:3000/api/vehicles/plate?plate=ABC1234"
```

**Response:**
```json
{
  "success": false,
  "message": "Plate lookup not available. Please select brand and model manually.",
  "vehicle": null
}
```

## Configuration

### No Configuration Required!

Unlike the previous Creditas integration, fetchicles requires no configuration:
- ✅ No API keys needed
- ✅ No authentication setup
- ✅ No environment variables required
- ✅ Works immediately after installation

### Installation

The package is already installed in your project:

```bash
npm install fetchicles
```

## User Interface

### Vehicle Form Component

The `VehicleForm` component provides a comprehensive interface for adding vehicles:

**Features:**
- **Vehicle Type Selection**: Choose between Car and Motorcycle
- **Brand Selection**: Choose from available brands for the selected vehicle type
- **Model Selection**: Select from detailed model options
- **Manual Entry**: Option to manually enter vehicle information
- **Real-time Validation**: Form validation with helpful error messages

**Usage:**
```tsx
import VehicleForm from '@/components/vehicle-form';

<VehicleForm 
  onSubmit={handleVehicleSubmit}
  loading={isLoading}
  initialData={existingVehicleData}
/>
```

### Add Vehicle Page

Access the add vehicle functionality at `/account/add-vehicle`:

- Clean, intuitive interface
- Vehicle type selection (Car/Motorcycle)
- Dynamic brand and model loading
- Success feedback and automatic redirection

## Data Model

### Vehicle Schema

The vehicle data model supports comprehensive vehicle information:

```typescript
interface Vehicle {
  id: string;
  plate: string;
  model?: string;
  color?: string;
  brand?: string;
  modelVersion?: string;
  manufacturingYear?: number;
  modelYear?: number;
  numberOfDoors?: number;
  fuelType?: string;
  accessoryPackage?: string;
  estimatedValue?: number;
  isDefault: boolean;
}
```

## Testing

### Test Script

Run the vehicle service test script to verify integration:

```bash
npm run test:vehicles
```

### Manual Testing

1. **Test Brand Loading:**
   - Navigate to `/account/add-vehicle`
   - Select vehicle type (Car/Motorcycle)
   - Verify brands load correctly

2. **Test Model Loading:**
   - Select a brand
   - Verify models load with detailed information

3. **Test Vehicle Type Switching:**
   - Switch between Car and Motorcycle
   - Verify brands and models update accordingly

## Available Vehicle Types

The fetchicles package supports two vehicle types:

### Cars (CAR)
- Comprehensive list of car brands from around the world
- Detailed model information for each brand
- Default settings: 4 doors, Gasoline fuel, Basic package

### Motorcycles (MOTORCYCLE)
- Extensive list of motorcycle brands
- Model information for each motorcycle brand
- Optimized for motorcycle-specific data

## Error Handling

The integration includes comprehensive error handling:

- **Network Issues**: Graceful handling of connectivity problems
- **Invalid Data**: Validation and sanitization of user input
- **Service Errors**: User-friendly error messages
- **Fallback Options**: Manual entry when automatic data fails

## Performance

- **Fast Loading**: Brands and models load quickly from local package data
- **Caching**: Data is cached by the fetchicles package
- **Optimistic Updates**: UI updates immediately while data loads
- **Lazy Loading**: Models are only loaded when a brand is selected

## Future Enhancements

Potential improvements for the vehicle service:

1. **Additional Vehicle Types**: Support for trucks, buses, etc.
2. **Enhanced Model Data**: More detailed specifications
3. **Localization**: Support for different languages
4. **Caching Layer**: Implement additional caching for better performance
5. **Integration with Reservations**: Use vehicle data to improve reservation accuracy

## Troubleshooting

### Common Issues

1. **"Failed to fetch vehicle brands"**
   - Check if fetchicles package is installed: `npm list fetchicles`
   - Verify internet connection
   - Try reinstalling the package: `npm install fetchicles`

2. **"No models found for brand"**
   - Verify the brand name is correct (case insensitive)
   - Check if the brand exists in the selected vehicle type
   - Try a different brand

3. **"Vehicle type not supported"**
   - Only `CAR` and `MOTORCYCLE` are supported
   - Check the API call parameters

### Support

For issues related to the vehicle service integration:

1. Check the [fetchicles package documentation](https://www.npmjs.com/package/fetchicles)
2. Verify the package is installed and up to date
3. Test with the provided test script
4. Check application logs for detailed error information

## Migration from Creditas

If you were previously using the Creditas integration:

### What Changed
- ✅ **Simplified Setup**: No more API keys or authentication
- ✅ **Better Performance**: Faster loading with local data
- ✅ **More Reliable**: No dependency on external API availability
- ✅ **Easier Maintenance**: No token management or refresh logic

### What Stayed the Same
- ✅ **Same API Endpoints**: All existing endpoints work the same way
- ✅ **Same UI**: Vehicle form looks and works identically
- ✅ **Same Data Model**: Vehicle data structure unchanged
- ✅ **Same User Experience**: Users won't notice any difference

The migration is seamless and provides a better, more reliable experience!
