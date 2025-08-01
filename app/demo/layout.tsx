import '../globals.css';
import '../base-styles.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import DemoNavigation from './navigation';

export const metadata: Metadata = {
  title: 'Onix AI Sales Agent - Demo',
  description: 'A demo of the Onix AI Sales Agent UI with the new color palette',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <DemoNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}