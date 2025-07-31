import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Evening Toolkit - Mindful Evening Check-ins',
  description: 'A gentle tool to help you navigate evening emotions and eating with curiosity and self-compassion.',
  keywords: 'mindful eating, evening toolkit, emotional eating, self-care, wellness',
  authors: [{ name: 'Evening Toolkit Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#6366f1',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}