import { vehicleService } from '../src/lib/vehicle-service';

async function testVehicleService() {
  console.log('🚗 Testing Vehicle Service (fetchicles integration)...\n');

  try {
    // Test 1: Get car brands
    console.log('1. Testing getBrands for cars...');
    const carBrands = await vehicleService.getBrands('CAR');
    console.log(`✅ Found ${carBrands.length} car brands`);
    console.log('First 10 car brands:', carBrands.slice(0, 10).map(b => b.name));
    console.log('');

    // Test 2: Get motorcycle brands
    console.log('2. Testing getBrands for motorcycles...');
    const motorcycleBrands = await vehicleService.getBrands('MOTORCYCLE');
    console.log(`✅ Found ${motorcycleBrands.length} motorcycle brands`);
    console.log('First 5 motorcycle brands:', motorcycleBrands.slice(0, 5).map(b => b.name));
    console.log('');

    // Test 3: Get models for a specific car brand
    console.log('3. Testing getModels for Ford cars...');
    const fordModels = await vehicleService.getModels('Ford', 'CAR');
    console.log(`✅ Found ${fordModels.length} Ford car models`);
    if (fordModels.length > 0) {
      console.log('First 5 Ford models:', fordModels.slice(0, 5).map(m => m.name));
    }
    console.log('');

    // Test 4: Get models for a specific motorcycle brand
    console.log('4. Testing getModels for Honda motorcycles...');
    const hondaModels = await vehicleService.getModels('Honda', 'MOTORCYCLE');
    console.log(`✅ Found ${hondaModels.length} Honda motorcycle models`);
    if (hondaModels.length > 0) {
      console.log('First 5 Honda motorcycle models:', hondaModels.slice(0, 5).map(m => m.name));
    }
    console.log('');

    // Test 5: Validate brand
    console.log('5. Testing brand validation...');
    const isValidBrand = await vehicleService.validateBrand('Toyota', 'CAR');
    const isInvalidBrand = await vehicleService.validateBrand('NonExistentBrand', 'CAR');
    console.log(`✅ Toyota is valid: ${isValidBrand}`);
    console.log(`✅ NonExistentBrand is invalid: ${!isInvalidBrand}`);
    console.log('');

    // Test 6: Validate model
    console.log('6. Testing model validation...');
    const isValidModel = await vehicleService.validateModel('Toyota', 'Corolla', 'CAR');
    const isInvalidModel = await vehicleService.validateModel('Toyota', 'NonExistentModel', 'CAR');
    console.log(`✅ Toyota Corolla is valid: ${isValidModel}`);
    console.log(`✅ Toyota NonExistentModel is invalid: ${!isInvalidModel}`);
    console.log('');

    // Test 7: Plate lookup (should return null)
    console.log('7. Testing plate lookup...');
    const plateResult = await vehicleService.getVehicleByPlate('ABC1234');
    console.log(`✅ Plate lookup result: ${plateResult === null ? 'null (as expected)' : 'unexpected result'}`);
    console.log('');

    console.log('🎉 Vehicle service test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the vehicle form at /account/add-vehicle');
    console.log('2. Try selecting different vehicle types (Car/Motorcycle)');
    console.log('3. Test brand and model selection');

  } catch (error) {
    console.error('❌ Vehicle service test failed:', error instanceof Error ? error.message : String(error));
    console.log('\nTroubleshooting:');
    console.log('1. Make sure fetchicles package is installed: npm install fetchicles');
    console.log('2. Check your internet connection');
    console.log('3. Verify the fetchicles package is working correctly');
  }
}

// Run the test
testVehicleService().catch(console.error);
