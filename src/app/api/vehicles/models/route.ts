import { NextRequest, NextResponse } from 'next/server';
import { vehicleService } from '../../../../lib/vehicle-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const vehicleType = searchParams.get('type') as 'CAR' | 'MOTORCYCLE' || 'CAR';

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand parameter is required' },
        { status: 400 }
      );
    }

    const models = await vehicleService.getModels(brand, vehicleType);

    return NextResponse.json({
      success: true,
      models: models.map(model => ({
        model: model.name,
        modelVersion: model.name,
        numberOfDoors: 4, // Default for cars
        fuelType: 'Gasolina',
        accessoryPackage: 'Básico'
      })),
    });

  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    );
  }
}
