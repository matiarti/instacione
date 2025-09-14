'use client';

import { useState } from 'react';
import { Car, Search, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show available lots
    window.location.href = '/search';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Parcin</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="/operator">Operator Dashboard</a>
              </Button>
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Now Available in São Paulo
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find Parking
            <span className="block text-primary">Anywhere</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Reserve your parking spot in advance and never worry about finding parking again.
          </p>
        </div>

        {/* Search Form */}
        <div className="mt-10 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Perfect Parking Spot</CardTitle>
              <CardDescription>
                Enter your destination and we&apos;ll show you available parking options nearby
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="destination" className="text-sm font-medium">
                      Where are you going?
                    </label>
                    <Input
                      id="destination"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter destination or address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Current location
                    </label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your current location"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Search className="w-4 h-4 mr-2" />
                  Find Parking
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight">Why Choose Parcin?</h3>
            <p className="mt-2 text-muted-foreground">
              The smartest way to find and reserve parking in São Paulo
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle>Easy Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find nearby parking lots with real-time availability and pricing.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <CreditCard className="h-6 w-6" />
                </div>
                <CardTitle>Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay a small reservation fee to secure your spot in advance.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <CardTitle>Guaranteed Spot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your parking spot is reserved and waiting for you when you arrive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}