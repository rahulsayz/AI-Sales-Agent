"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { AuthScreen } from './auth-screen';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { auth } from '@/lib/firebase';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, setUser } = useStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if auth state has been determined
    if (!isLoading) {
      setIsCheckingAuth(false);
    }
    
    // Log authentication state for debugging
    console.log("Auth state:", { isAuthenticated, isLoading, user: user?.id });
    
    // Check if Firebase auth is initialized but user state is not set
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log("Firebase auth state changed:", firebaseUser?.uid);
      if (firebaseUser && !user) {
        // User is authenticated in Firebase but not in our store
        console.log("User authenticated in Firebase but not in store, updating store");
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar_url: firebaseUser.photoURL || undefined,
          created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
          last_sign_in: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
        });
      }
    });
    
    return () => unsubscribe();
  }, [isLoading, isAuthenticated, user, setUser]);
  
  // Show loading screen while checking auth
  if (isCheckingAuth || isLoading) {
    return <LoadingScreen />;
  }
  
  // If not authenticated, show auth screen
  if (!isAuthenticated || !user) {
    console.log("User not authenticated, showing auth screen");
    return <AuthScreen />;
  }
  
  // If authenticated, show children
  console.log("User authenticated, showing content");
  return <>{children}</>;
}