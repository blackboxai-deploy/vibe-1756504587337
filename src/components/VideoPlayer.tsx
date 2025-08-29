"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Share2, 
  Heart,
  MoreHorizontal,
  SkipBack,
  SkipForward,
  Settings,
  Repeat,
  Shuffle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface VideoPlayerProps {
  src: string;
  title?: string;
  description?: string;
  duration?: number;
  aspectRatio?: string;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export default function VideoPlayer({
  src,
  title = "Generated Video",
  description,
  duration,
  aspectRatio = "16:9",
  onDownload,
  onShare,
  className = ""
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState([100]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying && !showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * videoDuration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume(value);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume[0] / 100;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Fullscreen not supported');
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    toast.success(`Playback speed: ${rate}x`);
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: description || 'Check out this AI-generated video!',
          url: src,
        });
      } else {
        await navigator.clipboard.writeText(src);
        toast.success('Video URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share video');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative group bg-black"
          style={{ aspectRatio: aspectRatio.replace(':', '/') }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setTimeout(() => setShowControls(false), 1000)}
        >
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            poster={`https://replicate.delivery/xezq/9ZaQsvy09xbfAS63jeDURYxXaUfSBcHG9HXGEXThboXLQ5fUB/tmplqkllzmo.mp4`}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full w-16 h-16 bg-white/90 hover:bg-white"
                onClick={togglePlay}
              >
                <Play className="h-8 w-8 text-black ml-1" />
              </Button>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                {description && (
                  <p className="text-white/80 text-sm">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
                      Speed: 0.5x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
                      Speed: 1x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
                      Speed: 1.25x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
                      Speed: 1.5x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(2)}>
                      Speed: 2x
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[progressPercentage]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(videoDuration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(-10)}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(10)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={isMuted ? [0] : volume}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {playbackRate}x
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}