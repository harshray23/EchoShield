"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FireboltIcon } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <FireboltIcon className="h-12 w-12 text-accent" />
        <div className="text-center">
          <h1 className="text-xl font-semibold">FireBase Explorer made by hasnain</h1>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
