'use client';

import { useSession, signOut } from 'next-auth/react';
import { Car, User, LogOut, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className = '' }: AuthHeaderProps) {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'OPERATOR':
        return 'default';
      case 'DRIVER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <header className={`border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Car className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Instacione</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* User info and role */}
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {session.user?.name}
                  </span>
                  {session.user?.role && (
                    <Badge variant={getRoleBadgeVariant(session.user.role)}>
                      {session.user.role}
                    </Badge>
                  )}
                </div>

                {/* Quick actions based on role */}
                {session.user?.role === 'OPERATOR' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/operator">Dashboard</Link>
                  </Button>
                )}

                {/* Language switcher */}
                <LanguageSwitcher />

                {/* Theme toggle */}
                <ModeToggle />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>
                          {session.user?.name ? getUserInitials(session.user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                        {session.user?.role && (
                          <Badge variant={getRoleBadgeVariant(session.user.role)} className="w-fit mt-1">
                            {session.user.role}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {session.user?.role === 'OPERATOR' && (
                      <DropdownMenuItem asChild>
                        <Link href="/operator" className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/search">Find Parking</Link>
                </Button>
                <LanguageSwitcher />
                <ModeToggle />
                <Button asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
