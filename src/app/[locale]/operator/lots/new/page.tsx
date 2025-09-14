'use client';

import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ParkingLotForm } from "@/components/parking-lot-form"

export default function NewParkingLotPage() {
  const router = useRouter();

  const handleSuccess = (lot: any) => {
    // Redirect to the lots page after successful creation
    router.push('/operator/lots');
  };

  const handleCancel = () => {
    router.push('/operator/lots');
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
                <ParkingLotForm
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
