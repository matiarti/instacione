import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parcin';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

class SystemTester {
  private results: TestResult[] = [];
  private client: MongoClient | null = null;

  async runAllTests() {
    console.log('🧪 Starting Parcin System Tests...\n');

    try {
      // Database tests
      await this.testDatabaseConnection();
      await this.testDatabaseModels();
      await this.testDatabaseIndexes();

      // API tests
      await this.testAPIEndpoints();
      await this.testAuthentication();
      await this.testReservationFlow();

      // Integration tests
      await this.testPaymentIntegration();
      await this.testEmailIntegration();
      await this.testMapsIntegration();

      // Performance tests
      await this.testPerformance();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        test: name,
        status: 'PASS',
        message: 'Test passed successfully',
        duration: Date.now() - startTime,
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        test: name,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      });
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testDatabaseConnection() {
    await this.runTest('Database Connection', async () => {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      await this.client.db().admin().ping();
    });
  }

  private async testDatabaseModels() {
    await this.runTest('Database Models', async () => {
      if (!this.client) throw new Error('Database not connected');
      
      const db = this.client.db();
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      const requiredCollections = ['users', 'parkinglots', 'reservations'];
      for (const collection of requiredCollections) {
        if (!collectionNames.includes(collection)) {
          throw new Error(`Missing collection: ${collection}`);
        }
      }
    });
  }

  private async testDatabaseIndexes() {
    await this.runTest('Database Indexes', async () => {
      if (!this.client) throw new Error('Database not connected');
      
      const db = this.client.db();
      
      // Check parking lots geospatial index
      const lotsIndexes = await db.collection('parkinglots').indexes();
      const hasGeospatialIndex = lotsIndexes.some(index => 
        index.key && index.key['location.geo'] === '2dsphere'
      );
      
      if (!hasGeospatialIndex) {
        throw new Error('Missing geospatial index on parking lots');
      }
    });
  }

  private async testAPIEndpoints() {
    await this.runTest('API Endpoints', async () => {
      const endpoints = [
        '/api/lots',
        '/api/auth/session',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok && response.status !== 401) {
          throw new Error(`API endpoint failed: ${endpoint} (${response.status})`);
        }
      }
    });
  }

  private async testAuthentication() {
    await this.runTest('Authentication System', async () => {
      // Test auth session endpoint
      const response = await fetch(`${BASE_URL}/api/auth/session`);
      if (!response.ok) {
        throw new Error('Authentication session endpoint failed');
      }
    });
  }

  private async testReservationFlow() {
    await this.runTest('Reservation Flow', async () => {
      // Test reservation creation endpoint
      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: '507f1f77bcf86cd799439011', // Test lot ID
          carPlate: 'TEST-1234',
          expectedHours: 2,
        }),
      });

      // Should fail without proper authentication, but endpoint should exist
      if (response.status === 404) {
        throw new Error('Reservation endpoint not found');
      }
    });
  }

  private async testPaymentIntegration() {
    await this.runTest('Payment Integration', async () => {
      // Test payment intent creation endpoint
      const response = await fetch(`${BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: '507f1f77bcf86cd799439011',
        }),
      });

      // Should fail without proper data, but endpoint should exist
      if (response.status === 404) {
        throw new Error('Payment endpoint not found');
      }
    });
  }

  private async testEmailIntegration() {
    await this.runTest('Email Integration', async () => {
      // Check if email service is configured
      if (!process.env.RESEND_API_KEY) {
        throw new Error('Email service not configured');
      }
    });
  }

  private async testMapsIntegration() {
    await this.runTest('Maps Integration', async () => {
      // Check if Google Maps API key is configured
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key not configured');
      }
    });
  }

  private async testPerformance() {
    await this.runTest('Performance', async () => {
      // Test API response times
      const startTime = Date.now();
      await fetch(`${BASE_URL}/api/lots`);
      const duration = Date.now() - startTime;
      
      if (duration > 5000) {
        throw new Error(`API response too slow: ${duration}ms`);
      }
    });
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  • ${result.test}: ${result.message}`);
        });
    }
    
    console.log('\n⏱️  Performance:');
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    console.log(`Average Test Duration: ${avgDuration.toFixed(0)}ms`);
    
    console.log('\n🎉 System test completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(console.error);
}

export default SystemTester;
