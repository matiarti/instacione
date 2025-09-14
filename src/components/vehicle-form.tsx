'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Autocomplete } from './ui/autocomplete';
import { Loader2, Car, Search } from 'lucide-react';

const vehicleFormSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  color: z.string().min(1, 'Cor é obrigatória'),
  brand: z.string().optional(),
  model: z.string().optional(),
  modelVersion: z.string().optional(),
  manufacturingYear: z.number().optional(),
  modelYear: z.number().optional(),
  numberOfDoors: z.number().optional(),
  fuelType: z.string().optional(),
  accessoryPackage: z.string().optional(),
  estimatedValue: z.number().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<VehicleFormData>;
}

interface VehicleModel {
  model: string;
  modelVersion: string;
  numberOfDoors: number;
  fuelType: string;
  accessoryPackage: string;
}

export default function VehicleForm({ onSubmit, loading = false, initialData }: VehicleFormProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingPlate, setLoadingPlate] = useState(false);
  const [error, setError] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE'>('CAR');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialData,
  });

  const plateValue = watch('plate');

  const loadBrands = useCallback(async () => {
    try {
      setLoadingBrands(true);
      setError('');
      const response = await fetch(`/api/vehicles/brands?type=${vehicleType}`);
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.brands);
      } else {
        setError('Erro ao carregar marcas de veículos');
      }
    } catch (error) {
      setError('Erro ao carregar marcas de veículos');
    } finally {
      setLoadingBrands(false);
    }
  }, [vehicleType]);

  const loadModels = useCallback(async () => {
    try {
      setLoadingModels(true);
      setError('');
      const response = await fetch(`/api/vehicles/models?brand=${encodeURIComponent(selectedBrand)}&type=${vehicleType}`);
      const data = await response.json();
      
      if (data.success) {
        setModels(data.models);
      } else {
        setError('Erro ao carregar modelos de veículos');
      }
    } catch (error) {
      setError('Erro ao carregar modelos de veículos');
    } finally {
      setLoadingModels(false);
    }
  }, [selectedBrand, vehicleType]);

  // Load brands when vehicle type changes
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Load models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadModels();
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedBrand, loadModels]);

  const searchByPlate = async () => {
    if (!plateValue || plateValue.length < 7) return;

    try {
      setLoadingPlate(true);
      setError('');
      const response = await fetch(`/api/vehicles/plate?plate=${encodeURIComponent(plateValue)}`);
      const data = await response.json();
      
      if (data.success && data.vehicle) {
        const vehicle = data.vehicle;
        
        // Set form values from plate search
        setValue('brand', vehicle.brand);
        setValue('model', vehicle.model);
        setValue('manufacturingYear', vehicle.manufacturingYear);
        setValue('modelYear', vehicle.modelYear);
        
        setSelectedBrand(vehicle.brand);
        
        // If there are versions, select the first one (usually the most complete)
        if (vehicle.versions && vehicle.versions.length > 0) {
          const version = vehicle.versions[0];
          setValue('modelVersion', version.modelVersion);
          setValue('estimatedValue', version.pricingDetail.value);
        }
      } else {
        setError('Busca por placa não disponível. Selecione marca e modelo manualmente.');
      }
    } catch (error) {
      setError('Erro ao buscar informações do veículo');
    } finally {
      setLoadingPlate(false);
    }
  };

  const handleModelSelect = (model: VehicleModel) => {
    setSelectedModel(model);
    setValue('model', model.model);
    setValue('modelVersion', model.modelVersion);
    setValue('numberOfDoors', model.numberOfDoors);
    setValue('fuelType', model.fuelType);
    setValue('accessoryPackage', model.accessoryPackage);
  };

  const onFormSubmit = async (data: VehicleFormData) => {
    try {
      setError('');
      await onSubmit(data);
    } catch (error) {
      setError('Erro ao salvar veículo');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Informações do Veículo
        </CardTitle>
        <CardDescription>
          Preencha as informações do seu veículo. Você pode buscar por placa ou preencher manualmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Plate Search */}
          <div className="space-y-2">
            <Label htmlFor="plate">Placa do Veículo *</Label>
            <div className="flex gap-2">
              <Input
                id="plate"
                placeholder="ABC1234 ou ABC1D23"
                {...register('plate')}
                className="uppercase flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchByPlate}
                disabled={loadingPlate || !plateValue || plateValue.length < 7}
                className="shrink-0"
              >
                {loadingPlate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.plate && (
              <p className="text-sm text-destructive">{errors.plate.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Cor *</Label>
            <Input
              id="color"
              placeholder="Ex: Branco, Preto, Prata..."
              {...register('color')}
            />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Tipo de Veículo</Label>
            <Autocomplete
              options={[
                { value: 'CAR', label: 'Carro' },
                { value: 'MOTORCYCLE', label: 'Moto' }
              ]}
              value={vehicleType}
              onValueChange={(value) => setVehicleType(value as 'CAR' | 'MOTORCYCLE')}
              placeholder="Selecione o tipo de veículo..."
              emptyMessage="Nenhum tipo encontrado."
            />
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Autocomplete
              options={brands.map((brand) => ({
                value: brand,
                label: brand,
              }))}
              value={selectedBrand}
              onValueChange={(value) => setSelectedBrand(value)}
              placeholder="Selecione uma marca..."
              emptyMessage="Nenhuma marca encontrada."
              disabled={loadingBrands}
            />
            {loadingBrands && (
              <p className="text-sm text-muted-foreground">Carregando marcas...</p>
            )}
          </div>

          {/* Model Selection with Autocomplete */}
          {models.length > 0 && (
            <div className="space-y-2">
              <Label>Modelo e Versão</Label>
              <Autocomplete
                options={models.map((model, index) => ({
                  value: model.modelVersion,
                  label: model.model,
                  description: `${model.numberOfDoors} portas • ${model.fuelType} • ${model.accessoryPackage}`
                }))}
                value={selectedModel?.modelVersion || ''}
                onValueChange={(value) => {
                  const model = models.find(m => m.modelVersion === value);
                  if (model) {
                    handleModelSelect(model);
                  }
                }}
                placeholder="Selecione um modelo..."
                emptyMessage="Nenhum modelo encontrado."
                disabled={loadingModels}
              />
            </div>
          )}

          {loadingModels && (
            <p className="text-sm text-muted-foreground">Carregando modelos...</p>
          )}

          {/* Estimated Value */}
          {watch('estimatedValue') && (
            <div className="space-y-2">
              <Label>Valor Estimado</Label>
              <Input
                value={`R$ ${watch('estimatedValue')?.toLocaleString('pt-BR')}`}
                disabled
                className="bg-muted-50"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Veículo'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
