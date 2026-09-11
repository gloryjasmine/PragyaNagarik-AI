import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PragyaNagarik AI',
  description: 'Multilingual, personalized and voice-enabled government services copilot discovering verified Central, State, and UT schemes and services.',
  openGraph: {
    title: 'PragyaNagarik AI',
    description: 'Multilingual, personalized and voice-enabled government services copilot discovering verified Central, State, and UT schemes and services.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
