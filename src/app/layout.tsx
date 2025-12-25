import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'shadcn-data-views',
  description: 'A simplified table management app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
