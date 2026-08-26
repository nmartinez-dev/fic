import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const description =
  'Plataforma de gestión operativa para Ferretería Industrial Cordillera: facturación, órdenes de compra, precios y categorías.';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Cordillera · Gestión',
    template: '%s · Cordillera',
  },
  description,
  applicationName: 'Cordillera',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ea580c' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
            </AuthProvider>
          </QueryProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
