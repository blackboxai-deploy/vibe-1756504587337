"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Play, Settings, Sparkles, Download, Clock, Film } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoGenerationFormProps {
  onGenerate: (params: VideoGenerationParams) => void;
  isGenerating: boolean;
  progress: number;
  generatedVideoUrl?: string;
  error?: string;
}

interface VideoGenerationParams {
  prompt: string;
  systemPrompt: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style: string;
  seed?: number;
  useRandomSeed: boolean;
}

const PROMPT_TEMPLATES = [
  {
    title: "Cinematic Scene",
    prompt: "A breathtaking cinematic shot of a lone figure walking through a misty forest at dawn, golden sunlight filtering through ancient trees, creating dramatic shadows and ethereal atmosphere"
  },
  {
    title: "Urban Timelapse",
    prompt: "Fast-paced timelapse of a bustling city intersection at night, with streaking car lights, neon signs reflecting on wet pavement, and people moving like ghosts through the frame"
  },
  {
    title: "Nature Documentary",
    prompt: "Close-up slow-motion footage of a hummingbird feeding from a vibrant red flower, with water droplets glistening in soft morning light, shot in documentary style"
  },
  {
    title: "Abstract Art",
    prompt: "Fluid abstract animation with swirling colors morphing from deep blues to vibrant oranges, creating mesmerizing patterns that flow like liquid paint in zero gravity"
  }
];

const DEFAULT_SYSTEM_PROMPT = `You are an expert video generation AI. Create high-quality, visually stunning videos based on the user's prompt. Focus on:
- Cinematic composition and lighting
- Smooth, natural motion
- Rich detail and texture
- Professional visual aesthetics
- Coherent storytelling through visuals`;

export default function VideoGenerationForm({ 
  onGenerate, 
  isGenerating, 
  progress, 
  generatedVideoUrl, 
  error 
}: VideoGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [duration, setDuration] = useState([10]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('high');
  const [style, setStyle] = useState('cinematic');
  const [seed, setSeed] = useState<number>();
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    const params: VideoGenerationParams = {
      prompt: prompt.trim(),
      systemPrompt,
      duration: duration[0],
      aspectRatio,
      quality,
      style,
      seed: useRandomSeed ? undefined : seed,
      useRandomSeed
    };

    onGenerate(params);
  };

  const handleTemplateSelect = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt);
  };

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);
    setUseRandomSeed(false);
  };

  const estimatedTime = Math.ceil(duration[0] * 0.8);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            AI Video Generation
          </CardTitle>
          <CardDescription>
            Create stunning videos from text descriptions using Google's Veo-3 model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Video Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the video you want to generate... Be specific about scenes, actions, lighting, and style."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{prompt.length} characters</span>
                  <span>Recommended: 50-500 characters</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="px-3">
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5s</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration[0]}s
                    </Badge>
                    <span>60s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={quality} onValueChange={setQuality} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (720p)</SelectItem>
                      <SelectItem value="high">High (1080p)</SelectItem>
                      <SelectItem value="ultra">Ultra (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                  disabled={isGenerating}
                />
                <p className="text-sm text-muted-foreground">
                  Customize the AI's behavior and style preferences
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Random Seed</Label>
                    <p className="text-sm text-muted-foreground">
                      Use random seed for varied results
                    </p>
                  </div>
                  <Switch
                    checked={useRandomSeed}
                    onCheckedChange={setUseRandomSeed}
                    disabled={isGenerating}
                  />
                </div>

                {!useRandomSeed && (
                  <div className="space-y-2">
                    <Label>Seed Value</Label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={seed || ''}
                        onChange={(e) => setSeed(parseInt(e.target.value) || undefined)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter seed number"
                        disabled={isGenerating}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomSeed}
                        disabled={isGenerating}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-3">
                {PROMPT_TEMPLATES.map((template, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium">{template.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.prompt}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isGenerating && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating video...</span>
                    <Badge variant="secondary">{progress}%</Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Estimated time: ~{estimatedTime} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedVideoUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Video generated successfully!</span>
                    <Button size="sm" asChild>
                      <a href={generatedVideoUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by Google Veo-3 via Replicate • Generation time: 5-15 minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}