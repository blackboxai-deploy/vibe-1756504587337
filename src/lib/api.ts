export interface VideoGenerationParams {
  prompt: string;
  systemPrompt?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style?: string;
  seed?: number;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
  createdAt: string;
  metadata?: {
    model: string;
    parameters: {
      duration: number;
      aspectRatio: string;
      quality: string;
    };
  };
}

export interface VideoStatusResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'completed' | 'failed' | 'canceled';
  progress?: number;
  output?: string | string[];
  videoUrl?: string;
  error?: string;
  logs?: string;
  created_at?: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

export interface VideoHistoryItem {
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
}

export class VideoAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getVideoStatus(id: string): Promise<VideoStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/status/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getVideoHistory(limit: number = 20, offset: number = 0, status?: string): Promise<{
    success: boolean;
    data: {
      videos: VideoHistoryItem[];
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${this.baseUrl}/api/history?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async addToHistory(video: Omit<VideoHistoryItem, 'createdAt'>): Promise<{
    success: boolean;
    data: VideoHistoryItem;
  }> {
    const response = await fetch(`${this.baseUrl}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(video),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateVideoHistory(id: string, updates: Partial<VideoHistoryItem>): Promise<{
    success: boolean;
    data: VideoHistoryItem;
  }> {
    const response = await fetch(`${this.baseUrl}/api/history`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteFromHistory(id: string): Promise<{
    success: boolean;
    data: VideoHistoryItem;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/history?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async cancelGeneration(id: string): Promise<VideoStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/status/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'cancel' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async downloadVideo(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  pollVideoStatus(
    id: string,
    onUpdate: (status: VideoStatusResponse) => void,
    onComplete: (status: VideoStatusResponse) => void,
    onError: (error: Error) => void,
    interval: number = 3000,
    maxAttempts: number = 300
  ): () => void {
    let attempts = 0;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        attempts++;
        const status = await this.getVideoStatus(id);
        onUpdate(status);

        if (status.status === 'succeeded' || status.status === 'completed') {
          onComplete(status);
          return;
        }

        if (status.status === 'failed') {
          onError(new Error(status.error || 'Video generation failed'));
          return;
        }

        if (attempts >= maxAttempts) {
          onError(new Error('Polling timeout: Maximum attempts reached'));
          return;
        }

        if (status.status === 'processing' || status.status === 'starting') {
          timeoutId = setTimeout(poll, interval);
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Polling error'));
      }
    };

    poll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }
}

export const videoAPI = new VideoAPI();

export default videoAPI;