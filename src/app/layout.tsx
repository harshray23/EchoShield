import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { AppProvider } from '@/lib/AppContext';

export const metadata: Metadata = {
  title: 'EchoShield AI | Scam Detection',
  description: 'Hear the truth before you trust. Advanced AI scam protection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans antialiased">
        <FirebaseClientProvider>
          <AppProvider>
            {children}
            <FirebaseErrorListener />
            <Toaster />
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
