"use client"

import * as React from "react"
import { Car, Home, Settings, Users, BarChart3, MapPin } from "lucide-react"
import { useTranslations } from 'next-intl'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// This is sample data.
const getData = (t: any) => ({
  navMain: [
    {
      title: t('operator.dashboard'),
      url: "/operator",
      icon: Home,
      isActive: true,
    },
    {
      title: t('operator.parkingLots'),
      url: "/operator/lots",
      icon: MapPin,
      items: [
        {
          title: t('operator.allLots'),
          url: "/operator/lots",
        },
        {
          title: t('operator.addNewLot'),
          url: "/operator/lots/new",
        },
      ],
    },
    {
      title: t('operator.reservations'),
      url: "/operator/reservations",
      icon: Car,
      items: [
        {
          title: t('operator.todaysReservations'),
          url: "/operator/reservations?filter=today",
        },
        {
          title: t('operator.allReservations'),
          url: "/operator/reservations",
        },
      ],
    },
    {
      title: t('operator.analytics'),
      url: "/operator/analytics",
      icon: BarChart3,
    },
    {
      title: t('operator.customers'),
      url: "/operator/customers",
      icon: Users,
    },
  ],
  secondary: [
    {
      title: t('common.settings'),
      url: "/operator/settings",
      icon: Settings,
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const data = getData(t);
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/operator">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Car className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Instacione</span>
                  <span className="truncate text-xs">{t('operator.operatorDashboard')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('operator.platform')}</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.items && (
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{t('operator.account')}</SidebarGroupLabel>
          <SidebarMenu>
            {data.secondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/auth/signin">
                <Settings />
                <span>{t('common.signOut')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
