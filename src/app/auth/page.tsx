'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInAnonymously 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Fingerprint, Ghost, ShieldCheck, AlertCircle, ExternalLink, Loader2, Key, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [domainError, setDomainError] = React.useState<string | null>(null);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const hasHandledRedirect = React.useRef(false);

  // Auto-redirect if authenticated
  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Handle redirect result with stable effect
  React.useEffect(() => {
    if (authLoading || hasHandledRedirect.current) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          hasHandledRedirect.current = true;
          const db = getFirestore();
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            email: result.user.email || '',
            safetyScore: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            userId: result.user.uid
          }, { merge: true });
          
          toast({ title: "Identity Verified", description: "Welcome back, Agent." });
          router.push('/dashboard');
        }
      })
      .catch((e: any) => {
        if (e.code === 'auth/unauthorized-domain') {
          setDomainError(window.location.hostname);
        } else {
          console.warn("Auth redirect cleanup:", e.message);
        }
      });
  }, [auth, authLoading, router, toast]);

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Access Denied", description: e.message });
      setLoading(false);
    }
  };

  const onEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        safetyScore: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: cred.user.uid
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Enrollment Failed", description: e.message });
      setLoading(false);
    }
  };

  const onGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch(e => {
       toast({ variant: "destructive", title: "Protocol Error", description: e.message });
    });
  };

  const onGuestLogin = () => {
    setLoading(true);
    signInAnonymously(auth).catch(e => {
      toast({ variant: "destructive", title: "Ghost Link Failed", description: e.message });
      setLoading(false);
    });
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
          <h1 className="text-4xl font-black tracking-tight text-white">Security Gateway</h1>
          <p className="text-muted-foreground font-medium">Authentication required to enter the console.</p>
        </div>

        {domainError && (
          <Alert variant="destructive" className="glass-card border-destructive/50 rounded-2xl bg-destructive/10">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Domain Authorization Required</AlertTitle>
            <AlertDescription className="space-y-3 pt-2">
              <p className="text-xs font-medium leading-relaxed">
                Add <code className="bg-white/10 px-1 rounded">{domainError}</code> to your Authorized Domains in the Firebase Console.
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
            <TabsTrigger value="login" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-tighter text-xs">Access</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-tighter text-xs">Enroll</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="glass-card border-white/5 rounded-[2rem]">
              <CardContent className="pt-8 space-y-6">
                <form onSubmit={onEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Protocol</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="email"
                        placeholder="agent@echoshield.ai" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-12 pl-11 rounded-xl bg-white/5 border-white/10" 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Encryption Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="h-12 pl-11 rounded-xl bg-white/5 border-white/10" 
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl btn-gradient cyber-glow" disabled={loading}>
                    {loading ? 'Establishing Link...' : 'ESTABLISH LINK'}
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase">
                    <span className="bg-[#05060f] px-2 text-muted-foreground font-black tracking-widest">Multi-Auth Protocols</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 font-bold flex gap-2 text-xs" onClick={onGoogleLogin}>
                    <ShieldCheck className="h-4 w-4 text-primary" /> Google
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 font-bold flex gap-2 text-xs" onClick={onGuestLogin} disabled={loading}>
                    <Ghost className="h-4 w-4 text-accent" /> Ghost
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="glass-card border-white/5 rounded-[2rem]">
              <CardContent className="pt-8 space-y-6">
                <form onSubmit={onEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Register Identity</label>
                    <Input 
                      type="email"
                      placeholder="agent@echoshield.ai" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-white/5 border-white/10" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Generate Key</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 rounded-xl bg-white/5 border-white/10" 
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl btn-gradient cyber-glow" disabled={loading}>
                    {loading ? 'Encrypting...' : 'CREATE IDENTITY'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
