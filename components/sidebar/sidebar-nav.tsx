"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MessageSquare, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col gap-2 p-4">
      <Link
        href="/chat"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
          pathname === "/chat" && "bg-muted text-foreground"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        Chats
      </Link>
      
      <Link
        href="/search"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
          pathname === "/search" && "bg-muted text-foreground"
        )}
      >
        <Search className="h-4 w-4" />
        Search
      </Link>
      
      <Link
        href="/documents"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
          pathname === "/documents" && "bg-muted text-foreground"
        )}
      >
        <FileText className="h-4 w-4" />
        Documents
      </Link>
      
      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
          pathname === "/settings" && "bg-muted text-foreground"
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </div>
  );
} 