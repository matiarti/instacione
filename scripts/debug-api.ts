import connectDB from '../lib/mongodb';
import ParkingLot from '../models/ParkingLot';

async function debugAPI() {
  try {
    console.log('🔄 Testing API functionality...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Test finding parking lots
    const lots = await ParkingLot.find({
      status: 'ACTIVE'
    });
    
    console.log(`📊 Found ${lots.length} parking lots`);
    
    if (lots.length > 0) {
      console.log('📋 Parking lots:');
      lots.forEach((lot, index) => {
        console.log(`  ${index + 1}. ${lot.name} - ${lot.location.address}`);
      });
    }
    
    // Test geospatial query
    console.log('\n🗺️ Testing geospatial query...');
    const geoLots = await ParkingLot.find({
      status: 'ACTIVE',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-46.6568, -23.5613] // Paulista coordinates
          },
          $maxDistance: 10000 // 10km
        }
      }
    });
    
    console.log(`📍 Found ${geoLots.length} lots near Paulista`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

debugAPI();
