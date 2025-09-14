import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import ParkingLot from '../../../../../models/ParkingLot';
import bcrypt from 'bcryptjs';

// Sample data for São Paulo, Brazil (Pinheiros and Paulista areas)
const sampleUsers = [
  {
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'OPERATOR' as const,
    password: 'password123',
    phone: '+55 11 99999-9999'
  },
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'OPERATOR' as const,
    password: 'password123',
    phone: '+55 11 88888-8888'
  },
  {
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    role: 'DRIVER' as const,
    password: 'password123',
    car: {
      plate: 'ABC-1234',
      model: 'Toyota Corolla',
      color: 'Silver'
    }
  },
  {
    name: 'Ana Oliveira',
    email: 'ana@example.com',
    role: 'DRIVER' as const,
    password: 'password123',
    car: {
      plate: 'XYZ-5678',
      model: 'Honda Civic',
      color: 'White'
    }
  }
];

const sampleParkingLots = [
  {
    name: 'Shopping Center Norte',
    operatorUserId: '', // Will be set after creating users
    location: {
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      geo: {
        type: 'Point' as const,
        coordinates: [-46.6568, -23.5613] // Paulista Avenue
      }
    },
    pricing: {
      hourly: 8.00,
      dailyMax: 60.00
    },
    capacity: 500,
    availabilityManual: 450,
    amenities: ['Security', 'Valet', 'EV Charging'],
    status: 'ACTIVE' as const,
    subscription: {
      plan: 'PLUS' as const,
      status: 'ACTIVE' as const,
      provider: 'stripe' as const
    }
  },
  {
    name: 'Estacionamento Pinheiros Plaza',
    operatorUserId: '', // Will be set after creating users
    location: {
      address: 'R. Teodoro Sampaio, 2000 - Pinheiros, São Paulo - SP',
      geo: {
        type: 'Point' as const,
        coordinates: [-46.6896, -23.5675] // Pinheiros
      }
    },
    pricing: {
      hourly: 6.00,
      dailyMax: 45.00
    },
    capacity: 200,
    availabilityManual: 180,
    amenities: ['Security', 'Covered'],
    status: 'ACTIVE' as const,
    subscription: {
      plan: 'BASIC' as const,
      status: 'ACTIVE' as const,
      provider: 'stripe' as const
    }
  },
  {
    name: 'Parking Consolação',
    operatorUserId: '', // Will be set after creating users
    location: {
      address: 'R. da Consolação, 3000 - Consolação, São Paulo - SP',
      geo: {
        type: 'Point' as const,
        coordinates: [-46.6608, -23.5505] // Consolação
      }
    },
    pricing: {
      hourly: 7.50,
      dailyMax: 50.00
    },
    capacity: 150,
    availabilityManual: 120,
    amenities: ['Security', 'Valet'],
    status: 'ACTIVE' as const,
    subscription: {
      plan: 'PLUS' as const,
      status: 'ACTIVE' as const,
      provider: 'stripe' as const
    }
  },
  {
    name: 'Estacionamento Vila Madalena',
    operatorUserId: '', // Will be set after creating users
    location: {
      address: 'R. Harmonia, 1000 - Vila Madalena, São Paulo - SP',
      geo: {
        type: 'Point' as const,
        coordinates: [-46.6934, -23.5462] // Vila Madalena
      }
    },
    pricing: {
      hourly: 5.50,
      dailyMax: 40.00
    },
    capacity: 100,
    availabilityManual: 85,
    amenities: ['Security'],
    status: 'ACTIVE' as const,
    subscription: {
      plan: 'BASIC' as const,
      status: 'ACTIVE' as const,
      provider: 'stripe' as const
    }
  },
  {
    name: 'Shopping Iguatemi',
    operatorUserId: '', // Will be set after creating users
    location: {
      address: 'Av. Brigadeiro Faria Lima, 2232 - Jardim Paulistano, São Paulo - SP',
      geo: {
        type: 'Point' as const,
        coordinates: [-46.6756, -23.5701] // Faria Lima
      }
    },
    pricing: {
      hourly: 12.00,
      dailyMax: 80.00
    },
    capacity: 800,
    availabilityManual: 720,
    amenities: ['Security', 'Valet', 'EV Charging', 'Covered'],
    status: 'ACTIVE' as const,
    subscription: {
      plan: 'PLUS' as const,
      status: 'ACTIVE' as const,
      provider: 'stripe' as const
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    // Simple security check - only allow in development/staging
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_SECRET || 'dev-seed-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🌱 Starting database seed...');
    
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await ParkingLot.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${userData.name}`);
    }

    // Create parking lots
    const operators = createdUsers.filter(user => user.role === 'OPERATOR');
    for (let i = 0; i < sampleParkingLots.length; i++) {
      const lotData = sampleParkingLots[i];
      const operator = operators[i % operators.length]; // Distribute lots among operators
      
      const lot = new ParkingLot({
        ...lotData,
        operatorUserId: operator._id
      });
      await lot.save();
      console.log(`🚗 Created parking lot: ${lotData.name}`);
    }

    console.log('✅ Database seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        usersCreated: createdUsers.length,
        parkingLotsCreated: sampleParkingLots.length,
        testAccounts: {
          operators: [
            { email: 'joao@example.com', password: 'password123' },
            { email: 'maria@example.com', password: 'password123' }
          ],
          drivers: [
            { email: 'pedro@example.com', password: 'password123' },
            { email: 'ana@example.com', password: 'password123' }
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
