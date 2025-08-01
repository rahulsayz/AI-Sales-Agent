"use client";

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useTheme } from 'next-themes';

export function useAppTheme() {
  const { theme, setTheme } = useTheme();
  const { userPreferences, updateUserPreferences } = useStore();
  
  useEffect(() => {
    // Sync theme from store to next-themes
    if (userPreferences.theme !== 'system') {
      setTheme(userPreferences.theme);
    }
  }, [userPreferences.theme, setTheme]);
  
  const updateTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updateUserPreferences({ theme: newTheme });
    setTheme(newTheme === 'system' ? 'system' : newTheme);
  };
  
  return {
    theme,
    updateTheme,
  };
}