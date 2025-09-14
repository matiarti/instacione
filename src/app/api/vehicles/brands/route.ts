import { NextRequest, NextResponse } from 'next/server';
import { vehicleService } from '../../../../lib/vehicle-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleType = searchParams.get('type') as 'CAR' | 'MOTORCYCLE' || 'CAR';

    const brands = await vehicleService.getBrands(vehicleType);

    return NextResponse.json({
      success: true,
      brands: brands.map(brand => brand.name),
    });

  } catch (error) {
    console.error('Error fetching vehicle brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle brands' },
      { status: 500 }
    );
  }
}
