import connectDB from '../lib/mongodb';

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const connection = await connectDB();
    
    if (connection) {
      console.log('✅ MongoDB connection successful!');
      console.log(`📊 Connected to: ${connection.connection.host}`);
      console.log(`🗄️ Database: ${connection.connection.name}`);
      
      // Test basic operations
      const db = connection.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        
        if (collections.length > 0) {
          console.log('📋 Existing collections:');
          collections.forEach(col => console.log(`  - ${col.name}`));
        }
      }
      
      await connection.connection.close();
      console.log('🔌 Connection closed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

testConnection();
