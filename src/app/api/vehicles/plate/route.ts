import { NextRequest, NextResponse } from 'next/server';
import { vehicleService } from '../../../../lib/vehicle-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plate = searchParams.get('plate');

    if (!plate) {
      return NextResponse.json(
        { error: 'Plate parameter is required' },
        { status: 400 }
      );
    }

    // Basic plate validation (Brazilian format)
    const plateRegex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    if (!plateRegex.test(plate.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid plate format' },
        { status: 400 }
      );
    }

    // Since fetchicles doesn't support plate lookup, we return a message
    // Users will need to manually select brand and model
    return NextResponse.json({
      success: false,
      message: 'Plate lookup not available. Please select brand and model manually.',
      vehicle: null,
    });

  } catch (error) {
    console.error('Error fetching vehicle by plate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    );
  }
}
