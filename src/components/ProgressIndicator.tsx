"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

interface ProgressIndicatorProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  progress: number;
  estimatedTime?: number;
  elapsedTime?: number;
  message?: string;
  error?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function ProgressIndicator({
  status,
  progress,
  estimatedTime,
  elapsedTime,
  message,
  error,
  showDetails = true,
  compact = false
}: ProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'canceled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
      case 'canceled':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'pending':
        return 'Initializing video generation...';
      case 'processing':
        return 'Generating your video...';
      case 'completed':
        return 'Video generated successfully!';
      case 'failed':
        return error || 'Video generation failed';
      case 'canceled':
        return 'Video generation was canceled';
      default:
        return 'Ready to generate';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRemainingTime = () => {
    if (!estimatedTime || status !== 'processing') return null;
    const remaining = estimatedTime - (elapsedTime || 0);
    return Math.max(0, remaining);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Progress value={progress} className="flex-1 h-2" />
        <Badge variant={getStatusBadgeVariant()} className="text-xs">
          {progress}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <Badge variant={getStatusBadgeVariant()}>
              {progress}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">{progress}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-sm text-center">
            <p className={`${status === 'failed' ? 'text-red-600' : 'text-muted-foreground'}`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Time Information */}
          {showDetails && (status === 'processing' || status === 'completed') && (
            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
              {elapsedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
              )}
              
              {getRemainingTime() && getRemainingTime()! > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>~{formatTime(getRemainingTime()!)} remaining</span>
                </div>
              )}
              
              {estimatedTime && status === 'completed' && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Completed in {formatTime(elapsedTime || estimatedTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {status === 'failed' && error && showDetails && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-500">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Processing Animation */}
          {status === 'processing' && (
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}