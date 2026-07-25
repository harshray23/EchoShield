'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInAnonymously 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, Ghost, ShieldCheck, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const authSchema = z.object({
  email: z.string().email('Access protocol requires valid email.'),
  password: z.string().min(8, 'Encryption key must be at least 8 characters.'),
});

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const handleAuthError = useCallback((e: any) => {
    if (e.code === 'auth/unauthorized-domain') {
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      setDomainError(domain);
      toast({ 
        variant: "destructive", 
        title: "Domain Not Authorized", 
        description: "Your security link requires domain authorization in the Firebase Console." 
      });
    } else if (e.code === 'auth/popup-blocked') {
      toast({ 
        variant: "destructive", 
        title: "Popup Blocked", 
        description: "Authentication window blocked. Using redirect mode..." 
      });
      signInWithRedirect(auth, new GoogleAuthProvider());
    } else {
      toast({ variant: "destructive", title: "Authentication Failed", description: e.message });
    }
  }, [auth, toast]);

  const createUserProfile = useCallback(async (uid: string, email: string) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email,
      safetyScore: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: uid
    }, { merge: true });
  }, [db]);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createUserProfile(result.user.uid, result.user.email || '');
          toast({ title: "Identity Verified", description: "Access granted via redirect." });
        }
      } catch (e: any) {
        handleAuthError(e);
      }
    };
    
    if (!authLoading && !user) {
      checkRedirect();
    }
  }, [user, authLoading, router, auth, toast, handleAuthError, createUserProfile]);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  const onLogin = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    setDomainError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Identity Verified", description: "Access granted to the console." });
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    setDomainError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await createUserProfile(credential.user.uid, values.email);
      toast({ title: "Identity Registered", description: "Your digital shield is now active." });
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setDomainError(null);
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (e: any) {
      handleAuthError(e);
    }
  };

  const onGuestLogin = async () => {
    setLoading(true);
    setDomainError(null);
    try {
      await signInAnonymously(auth);
      toast({ title: "Guest Access Enabled", description: "Limited persistence mode active." });
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-[2rem] bg-primary/10 border border-primary/20 cyber-glow">
              <Fingerprint className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Security Gateway</h1>
          <p className="text-muted-foreground font-medium">Authentication required to enter the console.</p>
        </div>

        {domainError && (
          <Alert variant="destructive" className="glass-card border-destructive/50 rounded-2xl bg-destructive/10">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Domain Authorization Required</AlertTitle>
            <AlertDescription className="space-y-3 pt-2">
              <p className="text-xs font-medium leading-relaxed">
                To enable Google login, you must add <code className="bg-white/10 px-1 rounded">{domainError}</code> to your Authorized Domains in the Firebase Console.
              </p>
              <Button size="sm" variant="destructive" className="w-full rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest" asChild>
                <a href={`https://console.firebase.google.com/project/firebase-explorer-3mnk1/authentication/settings`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3 w-3" /> Authorize Domain
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white/5 rounded-2xl mb-8 h-12">
            <TabsTrigger value="login" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-tighter">Access</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-tighter">Enroll</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="glass-card border-white/5 rounded-[2rem]">
              <CardContent className="pt-8 space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identity Protocol</FormLabel>
                        <FormControl><Input placeholder="agent@echoshield.ai" {...field} className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Encryption Key</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12 rounded-xl btn-gradient cyber-glow" disabled={loading}>
                      {loading ? 'Processing...' : 'ESTABLISH LINK'}
                    </Button>
                  </form>
                </Form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#05060f] px-2 text-muted-foreground font-black tracking-widest">Multi-Auth Protocols</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 font-bold flex gap-2" onClick={onGoogleLogin}>
                    <ShieldCheck className="h-4 w-4 text-primary" /> Google
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 font-bold flex gap-2" onClick={onGuestLogin} disabled={loading}>
                    <Ghost className="h-4 w-4 text-accent" /> Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="glass-card border-white/5 rounded-[2rem]">
              <CardContent className="pt-8 space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSignup)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Register Identity</FormLabel>
                        <FormControl><Input placeholder="agent@echoshield.ai" {...field} className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Generate Key</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12 rounded-xl btn-gradient cyber-glow" disabled={loading}>
                      {loading ? 'Encrypting...' : 'CREATE IDENTITY'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
