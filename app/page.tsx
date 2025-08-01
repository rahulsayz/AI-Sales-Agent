import { AuthGuard } from '@/components/auth/auth-guard';
import { MainLayout } from '@/components/layout/main-layout';

export default function Home() {
  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/fallback.html" />
      </noscript>
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    </>
  );
}