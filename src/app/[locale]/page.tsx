'use client';

import { useState } from 'react';
import { Car, Search, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthHeader } from '@/components/auth-header';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show available lots
    window.location.href = '/search';
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            {t('home.badge')}
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('home.title')}
            <span className="block text-primary">{t('home.titleHighlight')}</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Search Form */}
        <div className="mt-10 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('home.searchForm.title')}</CardTitle>
              <CardDescription>
                {t('home.searchForm.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="destination" className="text-sm font-medium">
                      {t('home.searchForm.destinationLabel')}
                    </label>
                    <Input
                      id="destination"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('home.searchForm.destinationPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      {t('home.searchForm.locationLabel')}
                    </label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t('home.searchForm.locationPlaceholder')}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Search className="w-4 h-4 mr-2" />
                  {t('home.searchForm.button')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight">{t('home.features.title')}</h3>
            <p className="mt-2 text-muted-foreground">
              {t('home.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle>{t('home.features.easySearch.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.features.easySearch.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <CreditCard className="h-6 w-6" />
                </div>
                <CardTitle>{t('home.features.securePayment.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.features.securePayment.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <CardTitle>{t('home.features.guaranteedSpot.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.features.guaranteedSpot.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}