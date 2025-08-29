export interface VideoGenerationParams {
  prompt: string;
  systemPrompt: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style: string;
  seed?: number;
  useRandomSeed: boolean;
}

export interface VideoGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  duration?: number;
  aspectRatio?: string;
  quality?: string;
  style?: string;
  seed?: number;
}

export interface VideoGenerationResponse {
  id: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
  metadata?: {
    model: string;
    parameters: {
      duration: number;
      aspectRatio: string;
      quality: string;
      fps?: number;
    };
  };
}

export interface VideoStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  progress?: number;
  output?: string | string[];
  error?: string;
  logs?: string;
  created_at?: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
  };
  videoUrl?: string;
  message?: string;
}

export interface VideoHistory {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
  aspectRatio?: string;
  quality?: string;
  error?: string;
}

export interface VideoHistoryResponse {
  success: boolean;
  data: {
    videos: VideoHistory[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  estimatedTime?: number;
  message?: string;
}

export interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  aspectRatio?: string;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: string) => void;
  onEnded?: () => void;
}

export interface VideoTemplate {
  title: string;
  prompt: string;
  category?: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
}

export type VideoQuality = 'standard' | 'high' | 'ultra';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type VideoStyle = 'cinematic' | 'realistic' | 'artistic' | 'documentary' | 'animation';
export type VideoStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';