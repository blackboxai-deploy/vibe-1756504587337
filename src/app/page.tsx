'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Sparkles, 
  Film, 
  Clock, 
  Zap, 
  Star, 
  ArrowRight, 
  Video, 
  Wand2,
  Download,
  History,
  Settings
} from 'lucide-react';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

interface VideoExample {
  title: string;
  prompt: string;
  duration: string;
  quality: string;
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features: FeatureCard[] = [
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description: "Create stunning videos from simple text descriptions using Google's Veo-3 model",
      badge: "Latest AI"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Processing",
      description: "Generate videos in minutes, not hours. Optimized for speed and quality",
      badge: "5-15 min"
    },
    {
      icon: <Film className="h-6 w-6" />,
      title: "Professional Quality",
      description: "High-resolution output with cinematic composition and smooth motion",
      badge: "Up to 4K"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Full Control",
      description: "Customize duration, aspect ratio, quality, and style preferences",
      badge: "Flexible"
    }
  ];

  const videoExamples: VideoExample[] = [
    {
      title: "Cinematic Nature",
      prompt: "A majestic eagle soaring over snow-capped mountains at golden hour",
      duration: "15s",
      quality: "4K"
    },
    {
      title: "Urban Timelapse",
      prompt: "Bustling city intersection at night with neon lights and traffic streams",
      duration: "20s",
      quality: "1080p"
    },
    {
      title: "Abstract Art",
      prompt: "Fluid colors morphing from deep blues to vibrant oranges in zero gravity",
      duration: "10s",
      quality: "4K"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className={`text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                Powered by Google Veo-3 AI
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Video Generator
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your ideas into stunning videos with the power of artificial intelligence. 
                Simply describe your vision and watch it come to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link href="/generate">
                  <Play className="mr-2 h-5 w-5" />
                  Start Creating
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link href="/history">
                  <History className="mr-2 h-5 w-5" />
                  View Gallery
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span>Professional Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-green-500" />
                <span>Multiple Formats</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Creative Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional-quality videos from text descriptions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 lg:py-32 bg-white/30 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See What's Possible
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From cinematic scenes to abstract art, create any video you can imagine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoExamples.map((example, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {example.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {example.quality}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground italic">
                    "{example.prompt}"
                  </p>
                  
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center space-y-2">
                      <Film className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Video Preview</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Play className="mr-2 h-4 w-4" />
                    Try This Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Create Amazing Videos?
                </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Join thousands of creators using AI to bring their ideas to life. 
                  Start generating professional videos in minutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="px-8 py-6 text-lg">
                  <Link href="/generate">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Your First Video
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>5-15 minute generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Multiple download formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Professional quality output</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Film className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-lg">AI Video Gen</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create stunning videos with the power of artificial intelligence.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Text to Video</div>
                <div>HD Quality</div>
                <div>Fast Generation</div>
                <div>Multiple Formats</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Tools</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/generate" className="block hover:text-foreground transition-colors">
                  Video Generator
                </Link>
                <Link href="/history" className="block hover:text-foreground transition-colors">
                  Video Gallery
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Technology</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Google Veo-3</div>
                <div>Replicate API</div>
                <div>Next.js 15</div>
                <div>React 19</div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              © 2024 AI Video Generator. Powered by Google Veo-3.
            </div>
            <div className="flex items-center gap-4">
              <span>Built with Next.js & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}