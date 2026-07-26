'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, History, BookOpen, Settings, LogOut, Ghost, Menu } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="EchoShield AI Logo" className="h-16 w-16 object-contain rounded-xl animate-pulse" />
          <p className="text-xs font-black tracking-widest uppercase text-muted-foreground">Synchronizing Link...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      
      {/* Premium Floating Left Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-32px)] fixed left-6 top-4 z-40 bg-card/65 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(124,77,255,0.02)] rounded-[2.5rem] p-6 justify-between transition-all duration-300 hover:shadow-[0_16px_48px_rgba(124,77,255,0.05)]">
        <div className="space-y-10">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <img src="/logo.png" alt="EchoShield AI Logo" className="h-9 w-9 object-contain rounded-lg shadow-sm" />
            <span className="text-lg font-black tracking-tighter text-foreground uppercase">EchoShield</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-4 h-12 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                {user.isAnonymous ? <Ghost className="h-4 w-4" /> : (user.displayName?.[0] || user.email?.[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-foreground truncate">
                {user.isAnonymous ? 'Guest Agent' : (user.displayName || user.email)}
              </p>
              <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                {user.isAnonymous ? 'Ephemeral Mode' : 'Verified Profile'}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full rounded-2xl h-11 border-border bg-card/45 hover:bg-card text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-card/65 backdrop-blur-xl border-b border-border/40 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="EchoShield AI Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="text-sm font-black tracking-tighter uppercase">EchoShield</span>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card/95 backdrop-blur-xl border-r border-border/40 p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="EchoShield AI Logo" className="h-9 w-9 object-contain rounded-lg" />
                <span className="text-lg font-black tracking-tighter uppercase">EchoShield</span>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-4 h-12 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="space-y-4">
              <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-widest">
                Log Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-[312px] p-6 md:p-10 min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
