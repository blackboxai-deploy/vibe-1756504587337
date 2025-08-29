'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { History, Download, Play, Trash2, Search, Filter, Calendar, Clock, Film, Share2, Eye, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';

interface VideoHistory {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileSize?: string;
  model?: string;
}

export default function HistoryPage() {
  const [videos, setVideos] = useState<VideoHistory[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchQuery, statusFilter, sortBy]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage first
      const localHistory = localStorage.getItem('videoHistory');
      if (localHistory) {
        const parsed = JSON.parse(localHistory);
        setVideos(parsed);
      }

      // Also try to load from API
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.videos) {
          // Merge with local storage, avoiding duplicates
          const apiVideos = data.data.videos;
          const localVideos = localHistory ? JSON.parse(localHistory) : [];
          const mergedVideos = [...apiVideos];
          
          localVideos.forEach((localVideo: VideoHistory) => {
            if (!apiVideos.find((apiVideo: VideoHistory) => apiVideo.id === localVideo.id)) {
              mergedVideos.push(localVideo);
            }
          });
          
          setVideos(mergedVideos);
          localStorage.setItem('videoHistory', JSON.stringify(mergedVideos));
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load video history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(video =>
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(video => video.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'prompt':
          return a.prompt.localeCompare(b.prompt);
        default:
          return 0;
      }
    });

    setFilteredVideos(filtered);
  };

  const downloadVideo = async (video: VideoHistory) => {
    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${video.id}-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const shareVideo = async (video: VideoHistory) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Video',
          text: video.prompt,
          url: video.videoUrl
        });
      } else {
        await navigator.clipboard.writeText(video.videoUrl);
        toast.success('Video URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share video');
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const updatedVideos = videos.filter(video => video.id !== videoId);
      setVideos(updatedVideos);
      localStorage.setItem('videoHistory', JSON.stringify(updatedVideos));
      
      // Also try to delete from API
      await fetch(`/api/history?id=${videoId}`, { method: 'DELETE' });
      
      toast.success('Video deleted from history');
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const clearAllHistory = async () => {
    try {
      setVideos([]);
      localStorage.removeItem('videoHistory');
      toast.success('All history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading video history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Video History
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            View, manage, and download your AI-generated videos
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="duration">By Duration</SelectItem>
                  <SelectItem value="prompt">By Prompt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>

              {videos.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All History</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all video history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllHistory}>
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {videos.length} videos</span>
            <span>Showing: {filteredVideos.length} videos</span>
            <span>Completed: {videos.filter(v => v.status === 'completed').length}</span>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {videos.length === 0 ? 'No videos generated yet' : 'No videos match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {videos.length === 0 
                    ? 'Start creating amazing videos with AI to see them here'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {videos.length === 0 && (
                  <Button asChild>
                    <a href="/generate">
                      <Film className="h-4 w-4 mr-2" />
                      Generate Your First Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video relative bg-muted">
                      {video.status === 'completed' && video.videoUrl ? (
                        <video
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedVideo(video)}
                          poster={video.thumbnailUrl}
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(video.status)}>
                          {video.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.duration}s
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="font-medium line-clamp-2 mb-2">{video.prompt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(video.createdAt)}
                        </span>
                        <span>{video.aspectRatio}</span>
                      </div>
                      <div className="flex gap-2">
                        {video.status === 'completed' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setSelectedVideo(video)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => downloadVideo(video)}>
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => shareVideo(video)}>
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Video</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the video from your history. The video file will remain accessible via its URL.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteVideo(video.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-32 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                        {video.status === 'completed' && video.videoUrl ? (
                          <video
                            className="w-full h-full object-cover rounded cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <source src={video.videoUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <Film className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium line-clamp-2">{video.prompt}</p>
                          <Badge className={getStatusColor(video.status)}>
                            {video.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(video.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}s
                          </span>
                          <span>{video.aspectRatio}</span>
                          <span>{video.quality}</span>
                        </div>
                        <div className="flex gap-2">
                          {video.status === 'completed' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setSelectedVideo(video)}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadVideo(video)}>
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => shareVideo(video)}>
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the video from your history. The video file will remain accessible via its URL.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteVideo(video.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Video Details</DialogTitle>
                <DialogDescription>
                  Generated on {formatDate(selectedVideo.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video">
                  <video
                    controls
                    className="w-full h-full rounded-lg"
                    src={selectedVideo.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Prompt:</h4>
                  <p className="text-sm text-muted-foreground">{selectedVideo.prompt}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">{selectedVideo.duration}s</p>
                  </div>
                  <div>
                    <span className="font-medium">Aspect Ratio:</span>
                    <p className="text-muted-foreground">{selectedVideo.aspectRatio}</p>
                  </div>
                  <div>
                    <span className="font-medium">Quality:</span>
                    <p className="text-muted-foreground">{selectedVideo.quality}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(selectedVideo.status)}>
                      {selectedVideo.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => downloadVideo(selectedVideo)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => shareVideo(selectedVideo)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}