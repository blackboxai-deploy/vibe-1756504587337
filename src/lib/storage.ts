export interface VideoGeneration {
  id: string;
  prompt: string;
  systemPrompt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style?: string;
  error?: string;
  metadata?: {
    model: string;
    parameters: Record<string, any>;
  };
}

export interface UserPreferences {
  defaultDuration: number;
  defaultAspectRatio: string;
  defaultQuality: string;
  defaultStyle: string;
  systemPrompt: string;
  autoDownload: boolean;
  showAdvancedSettings: boolean;
}

const STORAGE_KEYS = {
  VIDEO_HISTORY: 'ai_video_generator_history',
  USER_PREFERENCES: 'ai_video_generator_preferences',
  GENERATION_QUEUE: 'ai_video_generator_queue',
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDuration: 10,
  defaultAspectRatio: '16:9',
  defaultQuality: 'high',
  defaultStyle: 'cinematic',
  systemPrompt: 'Generate a high-quality, cinematic video based on the user prompt. Focus on smooth motion, realistic lighting, and professional composition.',
  autoDownload: false,
  showAdvancedSettings: false,
};

export class VideoStorage {
  static getVideoHistory(): VideoGeneration[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEO_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading video history:', error);
      return [];
    }
  }

  static saveVideoHistory(videos: VideoGeneration[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only the latest 50 videos to prevent storage bloat
      const trimmedVideos = videos.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.VIDEO_HISTORY, JSON.stringify(trimmedVideos));
    } catch (error) {
      console.error('Error saving video history:', error);
    }
  }

  static addVideoToHistory(video: VideoGeneration): void {
    const history = this.getVideoHistory();
    const updatedHistory = [video, ...history.filter(v => v.id !== video.id)];
    this.saveVideoHistory(updatedHistory);
  }

  static updateVideoInHistory(id: string, updates: Partial<VideoGeneration>): void {
    const history = this.getVideoHistory();
    const updatedHistory = history.map(video => 
      video.id === id ? { ...video, ...updates } : video
    );
    this.saveVideoHistory(updatedHistory);
  }

  static removeVideoFromHistory(id: string): void {
    const history = this.getVideoHistory();
    const updatedHistory = history.filter(video => video.id !== id);
    this.saveVideoHistory(updatedHistory);
  }

  static getVideoById(id: string): VideoGeneration | null {
    const history = this.getVideoHistory();
    return history.find(video => video.id === id) || null;
  }

  static getUserPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  static saveUserPreferences(preferences: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  static getGenerationQueue(): VideoGeneration[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GENERATION_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading generation queue:', error);
      return [];
    }
  }

  static saveGenerationQueue(queue: VideoGeneration[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.GENERATION_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving generation queue:', error);
    }
  }

  static addToGenerationQueue(video: VideoGeneration): void {
    const queue = this.getGenerationQueue();
    const updatedQueue = [...queue, video];
    this.saveGenerationQueue(updatedQueue);
  }

  static removeFromGenerationQueue(id: string): void {
    const queue = this.getGenerationQueue();
    const updatedQueue = queue.filter(video => video.id !== id);
    this.saveGenerationQueue(updatedQueue);
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.VIDEO_HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  static clearQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.GENERATION_QUEUE);
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  static exportData(): string {
    const data = {
      history: this.getVideoHistory(),
      preferences: this.getUserPreferences(),
      queue: this.getGenerationQueue(),
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.history && Array.isArray(data.history)) {
        this.saveVideoHistory(data.history);
      }
      
      if (data.preferences && typeof data.preferences === 'object') {
        this.saveUserPreferences(data.preferences);
      }
      
      if (data.queue && Array.isArray(data.queue)) {
        this.saveGenerationQueue(data.queue);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  static getStorageUsage(): { used: number; available: number; percentage: number } {
    if (typeof window === 'undefined') {
      return { used: 0, available: 0, percentage: 0 };
    }
    
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimate available storage (most browsers have ~5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

export default VideoStorage;