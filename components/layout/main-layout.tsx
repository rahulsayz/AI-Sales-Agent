"use client";

import { Sidebar } from '@/components/sidebar/sidebar';
import { ChatWindow } from '@/components/chat/chat-window';
import { useStore } from '@/lib/store';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function MainLayout() {
  const { isLoading } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="flex h-screen">
      <div className="w-80 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 h-full">
        <ChatWindow />
      </div>
    </div>
  );
}