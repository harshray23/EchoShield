'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, Shield, History, BookOpen, Settings, LogOut, User as UserIcon, HelpCircle } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();

  const navItems = [
    { href: '/dashboard', label: 'Console', icon: LayoutDashboard },
    { href: '/dashboard/history', label: 'Scan History', icon: History },
    { href: '/learn', label: 'Academy', icon: BookOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return null;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/5 bg-background/50 backdrop-blur-xl">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">EchoShield</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  className="h-12 px-4 rounded-xl hover:bg-white/5 transition-all"
                >
                  <item.icon className={pathname === item.href ? 'text-primary' : ''} />
                  <span className={`font-bold ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-white/5">
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {user.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.displayName || user.email}</p>
                <button onClick={handleLogout} className="text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                  <LogOut className="h-3 w-3" /> Terminate Session
                </button>
              </div>
            </div>
          ) : (
            <Button className="w-full rounded-xl" onClick={() => router.push('/auth')}>
              Secure Access
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 px-6 md:hidden">
          <SidebarTrigger />
          <span className="text-lg font-black tracking-tighter">Console</span>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}