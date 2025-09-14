import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongodb';
import ParkingLot from '../../../../../models/ParkingLot';
import User from '../../../../../models/User';
import { z } from 'zod';

// GET /api/operator/lots - List operator's lots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Verify user is an operator
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'OPERATOR') {
      return NextResponse.json(
        { error: 'Access denied. Operator role required.' },
        { status: 403 }
      );
    }
    
    const lots = await ParkingLot.find({ operatorUserId: session.user.id })
      .populate('operatorUserId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      lots: lots.map(lot => ({
        id: lot._id,
        name: lot.name,
        address: lot.location.address,
        pricing: lot.pricing,
        capacity: lot.capacity,
        availability: lot.availabilityManual,
        status: lot.status,
        amenities: lot.amenities || [],
        subscription: lot.subscription,
        createdAt: lot.createdAt,
      }))
    });
    
  } catch (error) {
    console.error('Error fetching operator lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    );
  }
}

// POST /api/operator/lots - Create new lot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const createLotSchema = z.object({
      name: z.string().min(1),
      address: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      hourlyRate: z.number().positive(),
      dailyMax: z.number().positive().optional(),
      capacity: z.number().positive(),
      amenities: z.array(z.string()).optional(),
    });
    
    const body = await request.json();
    console.log('Request body:', body);
    const { name, address, latitude, longitude, hourlyRate, dailyMax, capacity, amenities } = createLotSchema.parse(body);
    
    // Verify user is an operator
    const operator = await User.findById(session.user.id);
    console.log('Found operator:', operator);
    if (!operator || operator.role !== 'OPERATOR') {
      console.log('User not found or not an operator:', { operator: operator?.role });
      return NextResponse.json(
        { error: 'Access denied. Operator role required.' },
        { status: 403 }
      );
    }
    
    // Create parking lot
    const lot = new ParkingLot({
      name,
      operatorUserId: session.user.id,
      location: {
        address,
        geo: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      pricing: {
        hourly: hourlyRate,
        dailyMax: dailyMax
      },
      capacity,
      availabilityManual: capacity, // Start with full availability
      amenities: amenities || [],
      status: 'ACTIVE',
      subscription: {
        plan: 'BASIC',
        status: 'ACTIVE',
        provider: 'stripe'
      }
    });
    
    await lot.save();
    
    return NextResponse.json({
      success: true,
      lot: {
        id: lot._id,
        name: lot.name,
        address: lot.location.address,
        pricing: lot.pricing,
        capacity: lot.capacity,
        availability: lot.availabilityManual,
        status: lot.status,
        createdAt: lot.createdAt,
      }
    });
    
  } catch (error) {
    console.error('Error creating lot:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create lot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
