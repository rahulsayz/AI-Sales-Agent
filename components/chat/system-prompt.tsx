"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { SlidersHorizontal } from "lucide-react"

const SystemPrompt = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 transition-all duration-200 hover:bg-accent/50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-orange-500 mr-1.5" />
          <span className="text-sm">System Prompt</span>
        </Button>
      </DialogTrigger>
    </Dialog>
  )
}

export default SystemPrompt 