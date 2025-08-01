"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, Download, Edit, Trash2, Copy, BarChart3 } from 'lucide-react';

interface PresentationLibraryProps {
  onBack: () => void;
  onSelect: (id: string) => void;
}

interface Presentation {
  id: string;
  title: string;
  date: string;
  slides: number;
  client: string;
  industry: string;
  views: number;
  downloads: number;
  thumbnail: string;
}

export function PresentationLibrary({ onBack, onSelect }: PresentationLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Mock presentation data
  const presentations: Presentation[] = [
    { 
      id: '1', 
      title: 'Acme Corp Solution Overview', 
      date: '2025-03-15', 
      slides: 12, 
      client: 'Acme Corp', 
      industry: 'Technology',
      views: 24,
      downloads: 5,
      thumbnail: '/placeholder.png'
    },
    { 
      id: '2', 
      title: 'Healthcare Solutions Pitch', 
      date: '2025-03-10', 
      slides: 18, 
      client: 'MediCare Inc', 
      industry: 'Healthcare',
      views: 15,
      downloads: 3,
      thumbnail: '/placeholder.png'
    },
    { 
      id: '3', 
      title: 'Financial Services Proposal', 
      date: '2025-03-05', 
      slides: 15, 
      client: 'Global Bank', 
      industry: 'Finance',
      views: 32,
      downloads: 8,
      thumbnail: '/placeholder.png'
    },
    { 
      id: '4', 
      title: 'Retail Analytics Platform Demo', 
      date: '2025-02-28', 
      slides: 20, 
      client: 'Retail Giant', 
      industry: 'Retail',
      views: 18,
      downloads: 4,
      thumbnail: '/placeholder.png'
    },
    { 
      id: '5', 
      title: 'Manufacturing Optimization Proposal', 
      date: '2025-02-20', 
      slides: 16, 
      client: 'Industrial Systems', 
      industry: 'Manufacturing',
      views: 12,
      downloads: 2,
      thumbnail: '/placeholder.png'
    },
    { 
      id: '6', 
      title: 'Education Platform Overview', 
      date: '2025-02-15', 
      slides: 14, 
      client: 'Learn Co', 
      industry: 'Education',
      views: 27,
      downloads: 6,
      thumbnail: '/placeholder.png'
    },
  ];
  
  // Filter and sort presentations
  const filteredPresentations = presentations
    .filter(p => 
      (industryFilter === 'all' || p.industry === industryFilter) &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.client.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'views') {
        return b.views - a.views;
      }
      return 0;
    });
  
  // Get unique industries for filter
  const uniqueIndustries = Array.from(new Set(presentations.map(p => p.industry)));
  const industries = ['all', ...uniqueIndustries];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Your Presentations</h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search presentations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry === 'all' ? 'All Industries' : industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredPresentations.map(presentation => (
          <div 
            key={presentation.id} 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div 
              className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center cursor-pointer"
              onClick={() => onSelect(presentation.id)}
            >
              <div className="text-center">
                <h3 className="font-medium">{presentation.title}</h3>
                <p className="text-sm text-muted-foreground">{presentation.slides} slides</p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{presentation.title}</h3>
                  <p className="text-sm text-muted-foreground">{presentation.client}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>{presentation.views}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{new Date(presentation.date).toLocaleDateString()}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  {presentation.industry}
                </span>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onSelect(presentation.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}