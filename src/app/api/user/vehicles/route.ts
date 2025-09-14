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

    const vehicles = user.car ? [{
      id: 'default',
      plate: user.car.plate || '',
      model: user.car.model || '',
      color: user.car.color || '',
      isDefault: true,
    }] : [];

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
    const { plate, model, color, isDefault } = vehicleSchema.parse(body);

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's car information
    user.car = {
      plate,
      model,
      color,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      vehicle: {
        id: 'default',
        plate,
        model,
        color,
        isDefault: true,
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
