import connectDB from '../lib/mongodb';
import ParkingLot from '../models/ParkingLot';
import Reservation from '../models/Reservation';

async function setupIndexes() {
  try {
    console.log('🔄 Setting up database indexes...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Create geospatial index for parking lots
    console.log('📍 Creating geospatial index for parking lots...');
    await ParkingLot.collection.createIndex({ 'location.geo': '2dsphere' });
    console.log('✅ Geospatial index created');
    
    // Create compound indexes for reservations
    console.log('📋 Creating reservation indexes...');
    await Reservation.collection.createIndex({ lotId: 1, state: 1 });
    await Reservation.collection.createIndex({ userId: 1, state: 1 });
    
    // Create TTL index for pending reservations (expire after 10 minutes)
    await Reservation.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });
    
    console.log('✅ Reservation indexes created');
    
    // List all indexes
    console.log('\n📊 Current indexes:');
    
    const lotIndexes = await ParkingLot.collection.listIndexes().toArray();
    console.log('Parking Lots indexes:');
    lotIndexes.forEach(index => console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`));
    
    const reservationIndexes = await Reservation.collection.listIndexes().toArray();
    console.log('\nReservation indexes:');
    reservationIndexes.forEach(index => console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`));
    
    console.log('\n✅ Database indexes setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Index setup failed:', error);
    process.exit(1);
  }
}

setupIndexes();
