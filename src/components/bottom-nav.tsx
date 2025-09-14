'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Search, User, Settings } from 'lucide-react';

export default function BottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Don't render on desktop or if mobile detection is still loading
  if (!isMobile) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: t('nav.home'),
      isActive: pathname === '/' || pathname.endsWith('/')
    },
    {
      href: '/search',
      icon: Search,
      label: t('nav.search'),
      isActive: pathname.includes('/search')
    },
    {
      href: '/account',
      icon: User,
      label: t('nav.account'),
      isActive: pathname.includes('/account')
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around bg-card border-t border-border">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors ${
              item.isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            prefetch={false}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
