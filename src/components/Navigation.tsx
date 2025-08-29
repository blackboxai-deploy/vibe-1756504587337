"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Video, 
  History, 
  Settings, 
  Sparkles,
  Film,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    description: 'Welcome & Overview'
  },
  {
    title: 'Generate',
    href: '/generate',
    icon: Video,
    description: 'Create AI Videos',
    badge: 'New'
  },
  {
    title: 'History',
    href: '/history',
    icon: History,
    description: 'Your Videos'
  }
];

interface NavigationProps {
  className?: string;
  onNavigate?: () => void;
}

export default function Navigation({ className, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Film className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight">
              AI Video Studio
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by Google Veo-3
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="px-3 py-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Quick Actions</span>
          </div>
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs"
              asChild
            >
              <Link href="/generate">
                <Video className="h-3 w-3" />
                New Video
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs"
              asChild
            >
              <Link href="/history">
                <Clock className="h-3 w-3" />
                Recent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="px-3 py-2 mt-auto">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-medium mb-1">AI-Powered</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Create stunning videos from text using advanced AI
          </p>
          <Button size="sm" className="w-full" asChild>
            <Link href="/generate">
              Start Creating
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}