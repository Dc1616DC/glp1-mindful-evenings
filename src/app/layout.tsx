import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GLP-1 Mindful Evenings - Gentle Evening Check-ins',
  description: 'A gentle, mindful companion for navigating evening emotions and eating habits with GLP-1 medication users.',
  keywords: 'GLP-1, mindful eating, evening toolkit, emotional eating, self-care, wellness, intuitive eating',
  authors: [{ name: 'GLP-1 Mindful Evenings Team' }],
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