import './globals.css';
import './base-styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Onix AI Sales Agent',
  description: 'A modern web-based UI for sales-focused AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="chunk-error-handler" strategy="beforeInteractive">
          {`
            // Use ES5 syntax for maximum compatibility
            window.onerror = function(message, source, lineno, colno, error) {
              // Check if this is a syntax error or chunk loading error
              if (message && (
                message.indexOf('SyntaxError') !== -1 || 
                message.indexOf('Loading chunk') !== -1 || 
                message.indexOf('failed') !== -1 ||
                message.indexOf('Unexpected token') !== -1 ||
                message.indexOf('missing )') !== -1
              )) {
                console.log('Detected error, attempting recovery...');
                
                // Try to clear cache
                if (window.caches) {
                  window.caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      window.caches.delete(names[i]);
                    }
                    // Reload after cache clear
                    window.location.href = '/';
                  });
                } else {
                  // If caches API not available, just reload
                  window.location.href = '/';
                }
                
                return true; // Prevent default error handling
              }
              
              return false; // Let other errors be handled normally
            };
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}