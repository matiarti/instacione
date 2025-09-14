import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const vehicleSchema = z.object({
  plate: z.string().min(1),
  model: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  modelVersion: z.string().optional(),
  manufacturingYear: z.number().optional(),
  modelYear: z.number().optional(),
  numberOfDoors: z.number().optional(),
  fuelType: z.string().optional(),
  accessoryPackage: z.string().optional(),
  estimatedValue: z.number().optional(),
  isDefault: z.boolean().optional().default(false),
});

// GET /api/user/vehicles - Get user's vehicles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle migration from old 'car' field to new 'cars' array
    if (!user.cars && (user as any).car) {
      // Migrate old car data to new cars array
      user.cars = [{
        plate: (user as any).car.plate || '',
        model: (user as any).car.model || '',
        color: (user as any).car.color || '',
        brand: (user as any).car.brand || '',
        modelVersion: (user as any).car.modelVersion || '',
        manufacturingYear: (user as any).car.manufacturingYear,
        modelYear: (user as any).car.modelYear,
        numberOfDoors: (user as any).car.numberOfDoors,
        fuelType: (user as any).car.fuelType || '',
        accessoryPackage: (user as any).car.accessoryPackage || '',
        estimatedValue: (user as any).car.estimatedValue,
        isDefault: true,
      }];
      
      // Remove the old car field
      delete (user as any).car;
      await user.save();
    }

    const vehicles = (user.cars || []).map((car: any, index: number) => ({
      id: car._id?.toString() || `car-${index}`,
      plate: car.plate || '',
      model: car.model || '',
      color: car.color || '',
      brand: car.brand || '',
      modelVersion: car.modelVersion || '',
      manufacturingYear: car.manufacturingYear,
      modelYear: car.modelYear,
      numberOfDoors: car.numberOfDoors,
      fuelType: car.fuelType || '',
      accessoryPackage: car.accessoryPackage || '',
      estimatedValue: car.estimatedValue,
      isDefault: car.isDefault || false,
    }));

    return NextResponse.json({
      success: true,
      vehicles,
    });
    
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/user/vehicles - Add a new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      plate, 
      model, 
      color, 
      brand,
      modelVersion,
      manufacturingYear,
      modelYear,
      numberOfDoors,
      fuelType,
      accessoryPackage,
      estimatedValue,
      isDefault 
    } = vehicleSchema.parse(body);

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize cars array if it doesn't exist
    if (!user.cars) {
      user.cars = [];
    }

    // If this is the first vehicle or if isDefault is true, set it as default
    const shouldBeDefault = user.cars.length === 0 || isDefault;

    // If setting as default, remove default from other vehicles
    if (shouldBeDefault) {
      user.cars.forEach((car: any) => {
        car.isDefault = false;
      });
    }

    // Add new vehicle to the array
    const newVehicle = {
      plate,
      model,
      color,
      brand,
      modelVersion,
      manufacturingYear,
      modelYear,
      numberOfDoors,
      fuelType,
      accessoryPackage,
      estimatedValue,
      isDefault: shouldBeDefault,
    };

    user.cars.push(newVehicle);
    await user.save();

    // Get the newly added vehicle (last one in the array)
    const addedVehicle = user.cars[user.cars.length - 1];

    return NextResponse.json({
      success: true,
      vehicle: {
        id: addedVehicle._id?.toString() || `car-${user.cars.length - 1}`,
        plate,
        model,
        color,
        brand,
        modelVersion,
        manufacturingYear,
        modelYear,
        numberOfDoors,
        fuelType,
        accessoryPackage,
        estimatedValue,
        isDefault: shouldBeDefault,
      },
    });
    
  } catch (error) {
    console.error('Error adding vehicle:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add vehicle' },
      { status: 500 }
    );
  }
}

// PUT /api/user/vehicles - Update an existing vehicle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      vehicleId,
      plate, 
      model, 
      color, 
      brand,
      modelVersion,
      manufacturingYear,
      modelYear,
      numberOfDoors,
      fuelType,
      accessoryPackage,
      estimatedValue,
      isDefault 
    } = { vehicleId: '', ...vehicleSchema.parse(body) };

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.cars) {
      return NextResponse.json(
        { error: 'No vehicles found' },
        { status: 404 }
      );
    }

    // Find the vehicle to update
    const vehicleIndex = user.cars.findIndex((car: any) => 
      car._id?.toString() === vehicleId || car.plate === vehicleId
    );

    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // If setting as default, remove default from other vehicles
    if (isDefault) {
      user.cars.forEach((car: any) => {
        car.isDefault = false;
      });
    }

    // Update the vehicle
    user.cars[vehicleIndex] = {
      ...user.cars[vehicleIndex],
      plate,
      model,
      color,
      brand,
      modelVersion,
      manufacturingYear,
      modelYear,
      numberOfDoors,
      fuelType,
      accessoryPackage,
      estimatedValue,
      isDefault: isDefault || user.cars[vehicleIndex].isDefault,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      vehicle: {
        id: user.cars[vehicleIndex]._id?.toString() || `car-${vehicleIndex}`,
        plate,
        model,
        color,
        brand,
        modelVersion,
        manufacturingYear,
        modelYear,
        numberOfDoors,
        fuelType,
        accessoryPackage,
        estimatedValue,
        isDefault: user.cars[vehicleIndex].isDefault,
      },
    });
    
  } catch (error) {
    console.error('Error updating vehicle:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/vehicles - Set a vehicle as default
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vehicleId } = body;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.cars) {
      return NextResponse.json(
        { error: 'No vehicles found' },
        { status: 404 }
      );
    }

    // Find the vehicle to set as default
    const vehicleIndex = user.cars.findIndex((car: any) => 
      car._id?.toString() === vehicleId || car.plate === vehicleId
    );

    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Remove default from all vehicles
    user.cars.forEach((car: any) => {
      car.isDefault = false;
    });

    // Set the selected vehicle as default
    user.cars[vehicleIndex].isDefault = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Default vehicle updated successfully',
    });
    
  } catch (error) {
    console.error('Error setting default vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to set default vehicle' },
      { status: 500 }
    );
  }
}
