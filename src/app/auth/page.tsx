'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Fingerprint } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Access protocol requires valid email.'),
  password: z.string().min(8, 'Encryption key must be at least 8 characters.'),
});

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  const onLogin = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

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

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white/5 rounded-2xl mb-8 h-12">
            <TabsTrigger value="login" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white">ACCESS</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white">ENROLL</TabsTrigger>
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
                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-black tracking-widest">or third-party</span></div></div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5" onClick={onGoogleLogin}>
                  Secure Login with Google
                </Button>
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