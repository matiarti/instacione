'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Globe,
  Key,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTranslations } from 'next-intl';

interface OperatorSettings {
  profile: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reservationAlerts: boolean;
    paymentAlerts: boolean;
    systemUpdates: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  billing: {
    paymentMethod: string;
    billingAddress: string;
    taxId: string;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}

export default function OperatorSettings() {
  const t = useTranslations();
  const [settings, setSettings] = useState<OperatorSettings>({
    profile: {
      companyName: '',
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      reservationAlerts: true,
      paymentAlerts: true,
      systemUpdates: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    billing: {
      paymentMethod: '',
      billingAddress: '',
      taxId: ''
    },
    preferences: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: OperatorSettings = {
        profile: {
          companyName: 'Estacionamentos Silva Ltda',
          fullName: 'João Silva',
          email: 'joao@estacionamentosilva.com',
          phone: '+55 11 99999-9999',
          address: 'Rua das Flores, 123, São Paulo, SP'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          reservationAlerts: true,
          paymentAlerts: true,
          systemUpdates: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginAlerts: true
        },
        billing: {
          paymentMethod: 'Cartão de Crédito **** 1234',
          billingAddress: 'Rua das Flores, 123, São Paulo, SP',
          taxId: '12.345.678/0001-90'
        },
        preferences: {
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          dateFormat: 'DD/MM/YYYY'
        }
      };
      setSettings(mockData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const updateSecurity = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  const updateBilling = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value
      }
    }));
  };

  const updatePreferences = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('operator.settings.title')}</h1>
                    <p className="text-muted-foreground">{t('operator.settings.description')}</p>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? t('operator.settings.saving') : t('operator.settings.saveChanges')}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('operator.settings.profile')}
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {t('operator.settings.notifications')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t('operator.settings.security')}
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t('operator.settings.billing')}
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t('operator.settings.preferences')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {t('operator.settings.profileInformation')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">{t('operator.settings.companyName')}</Label>
                            <Input
                              id="companyName"
                              value={settings.profile.companyName}
                              onChange={(e) => updateProfile('companyName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fullName">{t('operator.settings.fullName')}</Label>
                            <Input
                              id="fullName"
                              value={settings.profile.fullName}
                              onChange={(e) => updateProfile('fullName', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">{t('operator.settings.email')}</Label>
                            <Input
                              id="email"
                              type="email"
                              value={settings.profile.email}
                              onChange={(e) => updateProfile('email', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">{t('operator.settings.phone')}</Label>
                            <Input
                              id="phone"
                              value={settings.profile.phone}
                              onChange={(e) => updateProfile('phone', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">{t('operator.settings.address')}</Label>
                          <Input
                            id="address"
                            value={settings.profile.address}
                            onChange={(e) => updateProfile('address', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          {t('operator.settings.notificationPreferences')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="emailNotifications">{t('operator.settings.emailNotifications')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.emailNotificationsDescription')}</p>
                            </div>
                            <Checkbox
                              id="emailNotifications"
                              checked={settings.notifications.emailNotifications}
                              onCheckedChange={(checked) => updateNotifications('emailNotifications', checked as boolean)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="smsNotifications">{t('operator.settings.smsNotifications')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.smsNotificationsDescription')}</p>
                            </div>
                            <Checkbox
                              id="smsNotifications"
                              checked={settings.notifications.smsNotifications}
                              onCheckedChange={(checked) => updateNotifications('smsNotifications', checked as boolean)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="reservationAlerts">{t('operator.settings.reservationAlerts')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.reservationAlertsDescription')}</p>
                            </div>
                            <Checkbox
                              id="reservationAlerts"
                              checked={settings.notifications.reservationAlerts}
                              onCheckedChange={(checked) => updateNotifications('reservationAlerts', checked as boolean)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="paymentAlerts">{t('operator.settings.paymentAlerts')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.paymentAlertsDescription')}</p>
                            </div>
                            <Checkbox
                              id="paymentAlerts"
                              checked={settings.notifications.paymentAlerts}
                              onCheckedChange={(checked) => updateNotifications('paymentAlerts', checked as boolean)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="systemUpdates">{t('operator.settings.systemUpdates')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.systemUpdatesDescription')}</p>
                            </div>
                            <Checkbox
                              id="systemUpdates"
                              checked={settings.notifications.systemUpdates}
                              onCheckedChange={(checked) => updateNotifications('systemUpdates', checked as boolean)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {t('operator.settings.securitySettings')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="twoFactorAuth">{t('operator.settings.twoFactorAuth')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.twoFactorAuthDescription')}</p>
                            </div>
                            <Checkbox
                              id="twoFactorAuth"
                              checked={settings.security.twoFactorAuth}
                              onCheckedChange={(checked) => updateSecurity('twoFactorAuth', checked as boolean)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="loginAlerts">{t('operator.settings.loginAlerts')}</Label>
                              <p className="text-sm text-muted-foreground">{t('operator.settings.loginAlertsDescription')}</p>
                            </div>
                            <Checkbox
                              id="loginAlerts"
                              checked={settings.security.loginAlerts}
                              onCheckedChange={(checked) => updateSecurity('loginAlerts', checked as boolean)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">{t('operator.settings.sessionTimeout')}</Label>
                            <Input
                              id="sessionTimeout"
                              type="number"
                              value={settings.security.sessionTimeout}
                              onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">{t('operator.settings.sessionTimeoutDescription')}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <Button variant="destructive" className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            {t('operator.settings.changePassword')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="billing" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {t('operator.settings.billingInformation')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">{t('operator.settings.paymentMethod')}</Label>
                          <Input
                            id="paymentMethod"
                            value={settings.billing.paymentMethod}
                            onChange={(e) => updateBilling('paymentMethod', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress">{t('operator.settings.billingAddress')}</Label>
                          <Input
                            id="billingAddress"
                            value={settings.billing.billingAddress}
                            onChange={(e) => updateBilling('billingAddress', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxId">{t('operator.settings.taxId')}</Label>
                          <Input
                            id="taxId"
                            value={settings.billing.taxId}
                            onChange={(e) => updateBilling('taxId', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="preferences" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {t('operator.settings.preferences')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="language">{t('operator.settings.language')}</Label>
                            <Input
                              id="language"
                              value={settings.preferences.language}
                              onChange={(e) => updatePreferences('language', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">{t('operator.settings.timezone')}</Label>
                            <Input
                              id="timezone"
                              value={settings.preferences.timezone}
                              onChange={(e) => updatePreferences('timezone', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="currency">{t('operator.settings.currency')}</Label>
                            <Input
                              id="currency"
                              value={settings.preferences.currency}
                              onChange={(e) => updatePreferences('currency', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateFormat">{t('operator.settings.dateFormat')}</Label>
                            <Input
                              id="dateFormat"
                              value={settings.preferences.dateFormat}
                              onChange={(e) => updatePreferences('dateFormat', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
