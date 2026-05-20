import type {Metadata} from 'next';
import Script from 'next/script';
import { Playfair_Display, Inter } from 'next/font/google';
import { GameProvider } from '@/lib/gameState';
import './globals.css'; // Global styles

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Shadows of the Abyss',
  description: 'An AI-powered dark fantasy story experience.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <head>
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="bg-black text-white font-sans selection:bg-orange-500 selection:text-black">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
