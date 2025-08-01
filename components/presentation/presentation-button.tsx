"use client";

import { useState, useEffect } from 'react';
import { Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { PresentationDashboard } from './presentation-dashboard';

export function PresentationButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    console.log(`Presentation button mounted, dialog state: ${isOpen ? 'open' : 'closed'}`);
    return () => {
      console.log("Presentation button unmounted");
    };
  }, []);
  
  useEffect(() => {
    console.log(`Presentation dialog state changed to: ${isOpen ? 'open' : 'closed'}`);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 transition-all duration-200 hover:bg-accent/50"
        >
          <Presentation className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
          <span className="text-sm">Presentation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Sales Presentation Generator</DialogTitle>
          <DialogDescription>
            Create and manage your sales presentations
          </DialogDescription>
        </DialogHeader>
        <PresentationDashboard onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}