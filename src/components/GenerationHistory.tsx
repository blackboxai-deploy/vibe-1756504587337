"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Download, 
  Play, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Film, 
  Grid3X3, 
  List,
  Share2,
  Eye,
  MoreVertical,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from './VideoPlayer';

interface VideoGeneration {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style?: string;
  model?: string;
  fileSize?: number;
}

interface GenerationHistoryProps {
  videos?: VideoGeneration[];
  onVideoSelect?: (video: VideoGeneration) => void;
  onVideoDelete?: (videoId: string) => void;
  onVideoDownload?: (video: VideoGeneration) => void;
  className?: string;
}

export default function GenerationHistory({
  videos: propVideos,
  onVideoSelect,
  onVideoDelete,
  onVideoDownload,
  className = ""
}: GenerationHistoryProps) {
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoGeneration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoGeneration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (propVideos) {
      setVideos(propVideos);
    } else {
      loadHistory();
    }
  }, [propVideos]);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Try to load from API first
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.videos) {
          setVideos(data.data.videos);
        }
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('videoHistory');
        if (saved) {
          const parsedVideos = JSON.parse(saved);
          setVideos(parsedVideos);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('videoHistory');
      if (saved) {
        const parsedVideos = JSON.parse(saved);
        setVideos(parsedVideos);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(video =>
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(video => video.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredVideos(filtered);
  };

  const handleVideoSelect = (video: VideoGeneration) => {
    setSelectedVideo(video);
    onVideoSelect?.(video);
  };

  const handleVideoDelete = async (videoId: string) => {
    try {
      // Try to delete from API
      const response = await fetch(`/api/history?id=${videoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        toast.success('Video deleted successfully');
      } else {
        // Fallback to localStorage
        const updated = videos.filter(v => v.id !== videoId);
        setVideos(updated);
        localStorage.setItem('videoHistory', JSON.stringify(updated));
        toast.success('Video deleted from local history');
      }

      onVideoDelete?.(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleVideoDownload = async (video: VideoGeneration) => {
    if (!video.videoUrl) {
      toast.error('Video URL not available');
      return;
    }

    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video downloaded successfully');
      onVideoDownload?.(video);
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video');
    }
  };

  const handleShare = async (video: VideoGeneration) => {
    if (!video.videoUrl) {
      toast.error('Video URL not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(video.videoUrl);
      toast.success('Video URL copied to clipboard');
    } catch (error) {
      console.error('Error sharing video:', error);
      toast.error('Failed to copy video URL');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const VideoCard = ({ video }: { video: VideoGeneration }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Video Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {video.videoUrl ? (
              <video
                className="w-full h-full object-cover"
                poster={video.thumbnailUrl}
                onClick={() => handleVideoSelect(video)}
              >
                <source src={video.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Play Overlay */}
            {video.videoUrl && (
              <div 
                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => handleVideoSelect(video)}
              >
                <Play className="h-12 w-12 text-white" />
              </div>
            )}

            {/* Status Badge */}
            <Badge className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}>
              {video.status}
            </Badge>
          </div>

          {/* Video Info */}
          <div className="space-y-2">
            <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
              {video.prompt}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{video.duration}s</span>
              <span>•</span>
              <span>{video.aspectRatio}</span>
              <span>•</span>
              <span>{video.quality}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDate(video.createdAt)}
              </span>
              
              <div className="flex items-center gap-1">
                {video.videoUrl && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoDownload(video);
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(video);
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this video? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleVideoDelete(video.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const VideoListItem = ({ video }: { video: VideoGeneration }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
            {video.videoUrl ? (
              <video className="w-full h-full object-cover">
                <source src={video.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1 mb-1">{video.prompt}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatDate(video.createdAt)}</span>
                  <span>•</span>
                  <span>{video.duration}s</span>
                  <span>•</span>
                  <span>{video.aspectRatio}</span>
                  <span>•</span>
                  <span>{video.quality}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(video.status)}>
                  {video.status}
                </Badge>
                
                {video.videoUrl && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVideoDownload(video)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(video)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this video? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleVideoDelete(video.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Generation History
              </CardTitle>
              <CardDescription>
                {filteredVideos.length} of {videos.length} videos
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'date' | 'duration' | 'status') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Videos */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                {videos.length === 0 
                  ? "Start generating videos to see them here"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {filteredVideos.map((video) => (
                viewMode === 'grid' ? (
                  <VideoCard key={video.id} video={video} />
                ) : (
                  <VideoListItem key={video.id} video={video} />
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      {selectedVideo && selectedVideo.videoUrl && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="line-clamp-1">{selectedVideo.prompt}</DialogTitle>
              <DialogDescription>
                Generated on {formatDate(selectedVideo.createdAt)} • {selectedVideo.duration}s • {selectedVideo.aspectRatio}
              </DialogDescription>
            </DialogHeader>
            
            <VideoPlayer
              src={selectedVideo.videoUrl}
              title={selectedVideo.prompt}
              onDownload={() => handleVideoDownload(selectedVideo)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}