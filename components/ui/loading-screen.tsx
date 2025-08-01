"use client";

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h3 className="text-xl font-medium mb-2">Loading</h3>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}