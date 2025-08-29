"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Sparkles, RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoSettings {
  duration: number;
  aspectRatio: string;
  quality: string;
  style: string;
  fps: number;
  seed?: number;
  useRandomSeed: boolean;
  systemPrompt: string;
  temperature: number;
  guidanceScale: number;
  numInferenceSteps: number;
}

interface SettingsPanelProps {
  settings: VideoSettings;
  onSettingsChange: (settings: VideoSettings) => void;
  disabled?: boolean;
}

const DEFAULT_SYSTEM_PROMPT = `You are an expert video generation AI. Create high-quality, visually stunning videos based on the user's prompt. Focus on:
- Cinematic composition and lighting
- Smooth, natural motion
- Rich detail and texture
- Professional visual aesthetics
- Coherent storytelling through visuals`;

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard (720p)', description: 'Good quality, faster generation' },
  { value: 'high', label: 'High (1080p)', description: 'High quality, balanced speed' },
  { value: 'ultra', label: 'Ultra (4K)', description: 'Maximum quality, slower generation' }
];

const STYLE_OPTIONS = [
  { value: 'cinematic', label: 'Cinematic', description: 'Movie-like with dramatic lighting' },
  { value: 'realistic', label: 'Realistic', description: 'Natural, documentary style' },
  { value: 'artistic', label: 'Artistic', description: 'Creative and stylized' },
  { value: 'documentary', label: 'Documentary', description: 'Professional, informative style' },
  { value: 'animation', label: 'Animation', description: 'Animated, cartoon-like' },
  { value: 'vintage', label: 'Vintage', description: 'Retro, film-grain aesthetic' }
];

const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9 (Landscape)', description: 'Standard widescreen format' },
  { value: '9:16', label: '9:16 (Portrait)', description: 'Mobile/social media format' },
  { value: '1:1', label: '1:1 (Square)', description: 'Instagram square format' },
  { value: '4:3', label: '4:3 (Classic)', description: 'Traditional TV format' },
  { value: '21:9', label: '21:9 (Ultrawide)', description: 'Cinematic ultrawide format' }
];

export default function SettingsPanel({ settings, onSettingsChange, disabled = false }: SettingsPanelProps) {
  const updateSetting = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      duration: 10,
      aspectRatio: '16:9',
      quality: 'high',
      style: 'cinematic',
      fps: 24,
      useRandomSeed: true,
      seed: undefined,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: 0.7,
      guidanceScale: 7.5,
      numInferenceSteps: 50
    });
  };

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    updateSetting('seed', newSeed);
    updateSetting('useRandomSeed', false);
  };

  const estimatedTime = Math.ceil(settings.duration * 0.8 + (settings.quality === 'ultra' ? 30 : settings.quality === 'high' ? 15 : 5));

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Video Settings
          </CardTitle>
          <CardDescription>
            Customize video generation parameters for optimal results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Basic Parameters
              <Badge variant="outline" className="text-xs">
                Est. {estimatedTime}min
              </Badge>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Duration: {settings.duration}s
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Longer videos take more time to generate</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="px-3">
                  <Slider
                    value={[settings.duration]}
                    onValueChange={(value) => updateSetting('duration', value[0])}
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frame Rate (FPS)</Label>
                <Select 
                  value={settings.fps.toString()} 
                  onValueChange={(value) => updateSetting('fps', parseInt(value))}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                    <SelectItem value="30">30 FPS (Standard)</SelectItem>
                    <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select 
                  value={settings.aspectRatio} 
                  onValueChange={(value) => updateSetting('aspectRatio', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIO_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality</Label>
                <Select 
                  value={settings.quality} 
                  onValueChange={(value) => updateSetting('quality', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <Select 
                value={settings.style} 
                onValueChange={(value) => updateSetting('style', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Advanced Parameters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Temperature: {settings.temperature}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Controls creativity vs consistency (0.1-1.0)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="px-3">
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={(value) => updateSetting('temperature', value[0])}
                    max={1.0}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Guidance Scale: {settings.guidanceScale}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How closely to follow the prompt (1-20)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="px-3">
                  <Slider
                    value={[settings.guidanceScale]}
                    onValueChange={(value) => updateSetting('guidanceScale', value[0])}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Loose</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Inference Steps: {settings.numInferenceSteps}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More steps = higher quality but slower generation</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="px-3">
                <Slider
                  value={[settings.numInferenceSteps]}
                  onValueChange={(value) => updateSetting('numInferenceSteps', value[0])}
                  max={100}
                  min={20}
                  step={10}
                  className="w-full"
                  disabled={disabled}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fast (20)</span>
                <span>Quality (100)</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seed Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Reproducibility</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Random Seed</Label>
                <p className="text-sm text-muted-foreground">
                  Use random seed for varied results
                </p>
              </div>
              <Switch
                checked={settings.useRandomSeed}
                onCheckedChange={(checked) => updateSetting('useRandomSeed', checked)}
                disabled={disabled}
              />
            </div>

            {!settings.useRandomSeed && (
              <div className="space-y-2">
                <Label>Seed Value</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={settings.seed || ''}
                    onChange={(e) => updateSetting('seed', parseInt(e.target.value) || undefined)}
                    placeholder="Enter seed number"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomSeed}
                    disabled={disabled}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Same seed + prompt = identical results
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* System Prompt */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">System Prompt</h4>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">AI Behavior Instructions</Label>
              <Textarea
                id="systemPrompt"
                value={settings.systemPrompt}
                onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                className="min-h-[100px] font-mono text-sm"
                disabled={disabled}
                placeholder="Customize how the AI interprets and generates videos..."
              />
              <p className="text-xs text-muted-foreground">
                Define the AI's style, focus areas, and generation preferences
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={disabled}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}