import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import ParkingLot from '../../../../../models/ParkingLot';
import User from '../../../../../models/User';
import { z } from 'zod';

// GET /api/operator/lots - List operator's lots
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // TODO: Get operator ID from session/auth
    const operatorId = '68c63f29bd2cc35b576495aa'; // Hardcoded for now
    
    const lots = await ParkingLot.find({ operatorUserId: operatorId })
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
    const { name, address, latitude, longitude, hourlyRate, dailyMax, capacity, amenities } = createLotSchema.parse(body);
    
    // TODO: Get operator ID from session/auth
    const operatorId = '68c63f29bd2cc35b576495aa'; // Hardcoded for now
    
    // Check if operator exists
    const operator = await User.findById(operatorId);
    if (!operator || operator.role !== 'OPERATOR') {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }
    
    // Create parking lot
    const lot = new ParkingLot({
      name,
      operatorUserId: operatorId,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create lot' },
      { status: 500 }
    );
  }
}
