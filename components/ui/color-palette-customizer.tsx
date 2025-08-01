"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Check, Copy, RefreshCw, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  foreground: string;
}

interface ColorTheme {
  name: string;
  colors: ColorPalette;
}

export function ColorPaletteCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');
  const [customColors, setCustomColors] = useState<ColorPalette>({
    primary: '#f76361',
    secondary: '#884f83',
    tertiary: '#263b58',
    background: '#ffffff',
    foreground: '#1a1a1a'
  });
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const { updateUserPreferences, userPreferences } = useStore();

  // Predefined color themes
  const colorThemes: ColorTheme[] = [
    {
      name: 'default',
      colors: {
        primary: '#f76361',
        secondary: '#884f83',
        tertiary: '#263b58',
        background: '#ffffff',
        foreground: '#1a1a1a'
      }
    },
    {
      name: 'ocean',
      colors: {
        primary: '#3b82f6',
        secondary: '#0ea5e9',
        tertiary: '#0f172a',
        background: '#f8fafc',
        foreground: '#0f172a'
      }
    },
    {
      name: 'forest',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        tertiary: '#064e3b',
        background: '#f8fafc',
        foreground: '#1a1a1a'
      }
    },
    {
      name: 'sunset',
      colors: {
        primary: '#f97316',
        secondary: '#db2777',
        tertiary: '#581c87',
        background: '#fffbeb',
        foreground: '#1e293b'
      }
    },
    {
      name: 'monochrome',
      colors: {
        primary: '#404040',
        secondary: '#737373',
        tertiary: '#171717',
        background: '#fafafa',
        foreground: '#171717'
      }
    },
    {
      name: 'vibrant',
      colors: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        tertiary: '#6366f1',
        background: '#ffffff',
        foreground: '#18181b'
      }
    }
  ];

  // Initialize with current theme if available
  useEffect(() => {
    const currentTheme = userPreferences.colorPalette;
    if (currentTheme) {
      setCustomColors(currentTheme);
      
      // Find if it matches a preset
      const matchingTheme = colorThemes.find(theme => 
        theme.colors.primary === currentTheme.primary &&
        theme.colors.secondary === currentTheme.secondary &&
        theme.colors.tertiary === currentTheme.tertiary
      );
      
      if (matchingTheme) {
        setSelectedTheme(matchingTheme.name);
      } else {
        setSelectedTheme('custom');
        setActiveTab('custom');
      }
    }
  }, [userPreferences.colorPalette]);

  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [key]: value
    }));
    setSelectedTheme('custom');
  };

  const handleThemeSelect = (themeName: string) => {
    const theme = colorThemes.find(t => t.name === themeName);
    if (theme) {
      setCustomColors(theme.colors);
      setSelectedTheme(themeName);
    }
  };

  const applyColorPalette = () => {
    // Update user preferences with the new color palette
    updateUserPreferences({
      colorPalette: customColors
    });
    
    // Apply CSS variables to the document root
    const root = document.documentElement;
    root.style.setProperty('--primary-color', customColors.primary);
    root.style.setProperty('--secondary-color', customColors.secondary);
    root.style.setProperty('--tertiary-color', customColors.tertiary);
    
    // Close the popover
    setIsOpen(false);
  };

  const extractColorsFromWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API to extract colors
      // For demo purposes, we'll simulate a response with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a "random" palette based on the URL (just for demo)
      // In a real implementation, you would use an API or service to extract actual colors
      const hash = Array.from(websiteUrl).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Generate colors based on the hash
      const hue1 = hash % 360;
      const hue2 = (hue1 + 30) % 360;
      const hue3 = (hue1 + 210) % 360;
      
      const newPalette = {
        primary: `hsl(${hue1}, 80%, 60%)`,
        secondary: `hsl(${hue2}, 70%, 50%)`,
        tertiary: `hsl(${hue3}, 60%, 25%)`,
        background: '#ffffff',
        foreground: '#1a1a1a'
      };
      
      setCustomColors(newPalette);
      setSelectedTheme('custom');
      setActiveTab('custom');
    } catch (error) {
      console.error('Error extracting colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPalette = () => {
    // Generate a random color palette
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + Math.floor(Math.random() * 60 + 30)) % 360;
    const hue3 = (hue1 + Math.floor(Math.random() * 60 + 180)) % 360;
    
    const newPalette = {
      primary: `hsl(${hue1}, 80%, 60%)`,
      secondary: `hsl(${hue2}, 70%, 50%)`,
      tertiary: `hsl(${hue3}, 60%, 25%)`,
      background: '#ffffff',
      foreground: '#1a1a1a'
    };
    
    setCustomColors(newPalette);
    setSelectedTheme('custom');
    setActiveTab('custom');
  };

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span>Colors</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium">Customize Color Palette</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a preset or create your own color scheme
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="website">From URL</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="presets" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  className={cn(
                    "p-2 rounded-md border flex flex-col items-center text-center hover:border-primary",
                    selectedTheme === theme.name ? "border-primary ring-1 ring-primary" : "border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => handleThemeSelect(theme.name)}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.tertiary }}></div>
                  </div>
                  <span className="text-xs capitalize">{theme.name}</span>
                </button>
              ))}
            </div>
            
            <Button 
              className="w-full"
              onClick={generateRandomPalette}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Random
            </Button>
          </TabsContent>
          
          <TabsContent value="website" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Button 
                  onClick={extractColorsFromWebsite}
                  disabled={isLoading || !websiteUrl}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a website URL to extract its color palette
              </p>
            </div>
            
            {isLoading && (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm">Extracting colors...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="p-4 space-y-4">
            <div className="space-y-3">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="grid grid-cols-5 items-center gap-2">
                  <Label htmlFor={`color-${key}`} className="col-span-2 capitalize">
                    {key}:
                  </Label>
                  <div className="col-span-2">
                    <div className="flex h-8 items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: value }}
                      ></div>
                      <Input
                        id={`color-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ColorPalette, e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => copyColorToClipboard(value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="p-4 border-t bg-muted/50">
          <div className="mb-4">
            <h5 className="text-sm font-medium mb-2">Preview</h5>
            <div className="flex gap-2 mb-2">
              <div className="h-8 flex-1 rounded-md" style={{ background: `linear-gradient(to right, ${customColors.primary}, ${customColors.secondary})` }}></div>
              <div className="h-8 w-8 rounded-md" style={{ backgroundColor: customColors.tertiary }}></div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                style={{ 
                  backgroundColor: customColors.primary,
                  borderColor: customColors.primary,
                  color: '#fff'
                }}
              >
                Primary
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                style={{ 
                  backgroundColor: customColors.secondary,
                  borderColor: customColors.secondary,
                  color: '#fff'
                }}
              >
                Secondary
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                style={{ 
                  backgroundColor: customColors.tertiary,
                  borderColor: customColors.tertiary,
                  color: '#fff'
                }}
              >
                Tertiary
              </Button>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={applyColorPalette}
          >
            <Check className="mr-2 h-4 w-4" />
            Apply Colors
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}