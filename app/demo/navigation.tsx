"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DemoNavigation() {
  const pathname = usePathname();
  
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#f76361] to-[#884f83] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v5m0 4v9M5 8l14 8M5 16l14-8"></path>
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[#f76361] to-[#884f83] bg-clip-text text-transparent">
                Onix AI Demo
              </span>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/demo' 
                    ? 'text-[#f76361] bg-[#f76361]/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#f76361] dark:hover:text-[#f76361]'
                }`}
              >
                Chat UI
              </Link>
              <Link 
                href="/demo/color-palette" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/demo/color-palette' 
                    ? 'text-[#884f83] bg-[#884f83]/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#884f83] dark:hover:text-[#884f83]'
                }`}
              >
                Color Palette
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#263b58] hover:bg-[#1e2e45]"
            >
              Back to App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}