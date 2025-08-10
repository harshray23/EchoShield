"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Database, HardDrive, Settings } from 'lucide-react';
import { FireboltIcon } from '@/components/icons';
import { UserNav } from './UserNav';

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
            <FireboltIcon className="h-12 w-12 animate-pulse text-accent" />
            <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/database', label: 'Database', icon: Database },
    { href: '/dashboard/storage', label: 'Storage', icon: HardDrive },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <FireboltIcon className="h-8 w-8 text-accent" />
            <span className="text-lg font-semibold">FireBase Explorer</span>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                onClick={() => router.push(item.href)}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Can add breadcrumbs here */}
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
