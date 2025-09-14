import { brands, models } from 'fetchicles';

export interface VehicleBrand {
  name: string;
}

export interface VehicleModel {
  name: string;
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year?: number;
  color?: string;
}

class VehicleService {
  private static instance: VehicleService;

  private constructor() {}

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  /**
   * Get all available vehicle brands
   * @param vehicleType - Type of vehicle (CAR or MOTORCYCLE)
   * @returns Promise<VehicleBrand[]>
   */
  async getBrands(vehicleType: 'CAR' | 'MOTORCYCLE' = 'CAR'): Promise<VehicleBrand[]> {
    try {
      const brandNames = await brands(vehicleType);
      return brandNames.map(name => ({ name }));
    } catch (error) {
      console.error('Error fetching vehicle brands:', error);
      throw new Error('Failed to fetch vehicle brands');
    }
  }

  /**
   * Get all models for a specific brand
   * @param brand - Brand name (case insensitive)
   * @param vehicleType - Type of vehicle (CAR or MOTORCYCLE)
   * @returns Promise<VehicleModel[]>
   */
  async getModels(brand: string, vehicleType: 'CAR' | 'MOTORCYCLE' = 'CAR'): Promise<VehicleModel[]> {
    try {
      const modelNames = await models({ vehicle: vehicleType, brand: brand.toLowerCase() });
      return modelNames.map(name => ({ name }));
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      throw new Error('Failed to fetch vehicle models');
    }
  }

  /**
   * Search for a vehicle by plate (simplified - just returns basic info)
   * Note: fetchicles doesn't support plate lookup, so this is a placeholder
   * @param plate - License plate
   * @returns Promise<VehicleInfo | null>
   */
  async getVehicleByPlate(plate: string): Promise<VehicleInfo | null> {
    // Since fetchicles doesn't support plate lookup, we'll return null
    // This could be enhanced with other services or manual entry
    console.log(`Plate lookup not supported by fetchicles: ${plate}`);
    return null;
  }

  /**
   * Validate if a brand exists
   * @param brand - Brand name to validate
   * @param vehicleType - Type of vehicle
   * @returns Promise<boolean>
   */
  async validateBrand(brand: string, vehicleType: 'CAR' | 'MOTORCYCLE' = 'CAR'): Promise<boolean> {
    try {
      const brands = await this.getBrands(vehicleType);
      return brands.some(b => b.name.toLowerCase() === brand.toLowerCase());
    } catch (error) {
      console.error('Error validating brand:', error);
      return false;
    }
  }

  /**
   * Validate if a model exists for a specific brand
   * @param brand - Brand name
   * @param model - Model name to validate
   * @param vehicleType - Type of vehicle
   * @returns Promise<boolean>
   */
  async validateModel(brand: string, model: string, vehicleType: 'CAR' | 'MOTORCYCLE' = 'CAR'): Promise<boolean> {
    try {
      const models = await this.getModels(brand, vehicleType);
      return models.some(m => m.name.toLowerCase() === model.toLowerCase());
    } catch (error) {
      console.error('Error validating model:', error);
      return false;
    }
  }
}

export const vehicleService = VehicleService.getInstance();
