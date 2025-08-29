'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Download, Settings, History, Wand2, Clock, Film, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  estimatedTime?: number;
}

interface VideoHistory {
  id: string;
  prompt: string;
  videoUrl: string;
  createdAt: string;
  duration: number;
  aspectRatio: string;
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Generate a high-quality, cinematic video based on the user prompt. Focus on smooth motion, realistic lighting, and professional composition.');
  const [duration, setDuration] = useState([10]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generationStatus && generationStatus.status === 'processing') {
      interval = setInterval(checkStatus, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationStatus]);

  const loadHistory = () => {
    const saved = localStorage.getItem('videoHistory');
    if (saved) {
      setVideoHistory(JSON.parse(saved));
    }
  };

  const saveToHistory = (video: VideoHistory) => {
    const updated = [video, ...videoHistory].slice(0, 20);
    setVideoHistory(updated);
    localStorage.setItem('videoHistory', JSON.stringify(updated));
  };

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus({
      id: Date.now().toString(),
      status: 'pending',
      progress: 0,
      estimatedTime: duration[0] * 6
    });

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          duration: duration[0],
          aspectRatio,
          quality,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if video is immediately completed (direct generation)
      if (data.status === 'completed' && data.videoUrl) {
        setGenerationStatus({
          id: data.id,
          status: 'completed',
          progress: 100,
          videoUrl: data.videoUrl
        });
        setCurrentVideo(data.videoUrl);
        setIsGenerating(false);
        
        const newVideo: VideoHistory = {
          id: data.id,
          prompt,
          videoUrl: data.videoUrl,
          createdAt: new Date().toISOString(),
          duration: duration[0],
          aspectRatio
        };
        
        saveToHistory(newVideo);
        toast.success('Video generated successfully!');
      } else {
        // Handle async generation
        setGenerationStatus(prev => prev ? {
          ...prev,
          id: data.id,
          status: data.status === 'processing' ? 'processing' : 'processing',
          progress: 10
        } : null);

        toast.success('Video generation started!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
      setIsGenerating(false);
      toast.error('Failed to start video generation');
    }
  };

  const checkStatus = async () => {
    if (!generationStatus?.id) return;

    try {
      const response = await fetch(`/api/status/${generationStatus.id}`);
      const data = await response.json();

      setGenerationStatus(prev => prev ? {
        ...prev,
        status: data.status,
        progress: data.progress || prev.progress,
        videoUrl: data.videoUrl || data.output?.[0], // Handle different response formats
        error: data.error
      } : null);

      const videoUrl = data.videoUrl || data.output?.[0];

      if (data.status === 'completed' && videoUrl) {
        setCurrentVideo(videoUrl);
        setIsGenerating(false);
        
        const newVideo: VideoHistory = {
          id: generationStatus.id,
          prompt,
          videoUrl: videoUrl,
          createdAt: new Date().toISOString(),
          duration: duration[0],
          aspectRatio
        };
        
        saveToHistory(newVideo);
        toast.success('Video generated successfully!');
      } else if (data.status === 'succeeded' && videoUrl) {
        // Handle different status naming conventions
        setCurrentVideo(videoUrl);
        setIsGenerating(false);
        
        const newVideo: VideoHistory = {
          id: generationStatus.id,
          prompt,
          videoUrl: videoUrl,
          createdAt: new Date().toISOString(),
          duration: duration[0],
          aspectRatio
        };
        
        saveToHistory(newVideo);
        toast.success('Video generated successfully!');
      } else if (data.status === 'failed') {
        setIsGenerating(false);
        toast.error(data.error || 'Video generation failed');
      } else if (data.status === 'processing') {
        // Continue polling for processing status
        setGenerationStatus(prev => prev ? {
          ...prev,
          progress: Math.min(prev.progress + 5, 95) // Gradually increase progress
        } : null);
      }
    } catch (error) {
      console.error('Status check error:', error);
      // Stop polling on error but don't show error unless it persists
      setGenerationStatus(prev => prev ? {
        ...prev,
        progress: Math.min(prev.progress + 2, 90) // Continue showing progress
      } : null);
    }
  };

  const downloadVideo = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const promptSuggestions = [
    "A majestic eagle soaring over snow-capped mountains at sunset",
    "Ocean waves crashing against rocky cliffs in slow motion",
    "A bustling city street with neon lights reflecting on wet pavement",
    "Cherry blossoms falling in a peaceful Japanese garden",
    "Northern lights dancing across a starry night sky",
    "A steam locomotive traveling through a misty forest",
    "Underwater coral reef with colorful tropical fish swimming",
    "Time-lapse of clouds forming over a vast desert landscape"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Video Generator
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Create stunning videos from text using Google's Veo-3 AI model. Describe your vision and watch it come to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Video Generation
                </CardTitle>
                <CardDescription>
                  Describe the video you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Video Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the video you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quick Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setPrompt(suggestion)}
                      >
                        {suggestion.slice(0, 30)}...
                      </Badge>
                    ))}
                  </div>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Duration: {duration[0]}s</Label>
                        <Slider
                          value={duration}
                          onValueChange={setDuration}
                          max={60}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <Select value={aspectRatio} onValueChange={setAspectRatio}>
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
                        <Select value={quality} onValueChange={setQuality}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="ultra">Ultra</SelectItem>
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
                        className="min-h-[80px]"
                        placeholder="Customize the AI's behavior and style..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={generateVideo}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Film className="mr-2 h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generationStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Generation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Status: {generationStatus.status}
                      </span>
                      <Badge variant={
                        generationStatus.status === 'completed' ? 'default' :
                        generationStatus.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {generationStatus.status}
                      </Badge>
                    </div>
                    
                    <Progress value={generationStatus.progress} className="w-full" />
                    
                    {generationStatus.estimatedTime && generationStatus.status === 'processing' && (
                      <p className="text-sm text-muted-foreground">
                        Estimated time remaining: ~{Math.max(0, generationStatus.estimatedTime - (generationStatus.progress / 100 * generationStatus.estimatedTime)).toFixed(0)}s
                      </p>
                    )}
                    
                    {generationStatus.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{generationStatus.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentVideo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Generated Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <video
                      controls
                      className="w-full rounded-lg"
                      style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                    >
                      <source src={currentVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadVideo(currentVideo, `generated-video-${Date.now()}.mp4`)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No videos generated yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {videoHistory.slice(0, 5).map((video) => (
                      <div key={video.id} className="border rounded-lg p-3 space-y-2">
                        <video
                          className="w-full rounded aspect-video object-cover cursor-pointer"
                          onClick={() => setCurrentVideo(video.videoUrl)}
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                        </video>
                        <p className="text-sm font-medium line-clamp-2">
                          {video.prompt}
                        </p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{video.duration}s • {video.aspectRatio}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadVideo(video.videoUrl, `video-${video.id}.mp4`)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Tips & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Writing Good Prompts:</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Be specific about camera movements</li>
                    <li>• Describe lighting and atmosphere</li>
                    <li>• Include motion and action details</li>
                    <li>• Specify time of day or setting</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-1">Best Practices:</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Start with shorter durations (10-15s)</li>
                    <li>• Use cinematic terms for better results</li>
                    <li>• Avoid complex multi-scene requests</li>
                    <li>• Be patient - quality takes time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}