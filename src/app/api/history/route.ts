import { NextRequest, NextResponse } from 'next/server';

interface VideoHistory {
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

// In-memory storage for demo purposes
// In production, use a proper database
let videoHistory: VideoHistory[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let filteredHistory = videoHistory;

    // Filter by status if provided
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      filteredHistory = videoHistory.filter(video => video.status === status);
    }

    // Sort by creation date (newest first)
    filteredHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedHistory = filteredHistory.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        videos: paginatedHistory,
        total: filteredHistory.length,
        limit,
        offset,
        hasMore: offset + limit < filteredHistory.length
      }
    });
  } catch (error) {
    console.error('Error fetching video history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch video history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, prompt, duration, aspectRatio, quality } = body;

    if (!id || !prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: id and prompt are required' 
        },
        { status: 400 }
      );
    }

    const newVideo: VideoHistory = {
      id,
      prompt,
      status: 'pending',
      createdAt: new Date().toISOString(),
      duration: duration || 5,
      aspectRatio: aspectRatio || '16:9',
      quality: quality || 'standard'
    };

    videoHistory.push(newVideo);

    return NextResponse.json({
      success: true,
      data: newVideo
    });
  } catch (error) {
    console.error('Error adding video to history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add video to history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, videoUrl, thumbnailUrl } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: id' 
        },
        { status: 400 }
      );
    }

    const videoIndex = videoHistory.findIndex(video => video.id === id);
    
    if (videoIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video not found in history' 
        },
        { status: 404 }
      );
    }

    // Update video status and other fields
    if (status) videoHistory[videoIndex].status = status;
    if (videoUrl) videoHistory[videoIndex].videoUrl = videoUrl;
    if (thumbnailUrl) videoHistory[videoIndex].thumbnailUrl = thumbnailUrl;
    
    if (status === 'completed') {
      videoHistory[videoIndex].completedAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      data: videoHistory[videoIndex]
    });
  } catch (error) {
    console.error('Error updating video history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update video history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: id' 
        },
        { status: 400 }
      );
    }

    const videoIndex = videoHistory.findIndex(video => video.id === id);
    
    if (videoIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video not found in history' 
        },
        { status: 404 }
      );
    }

    const deletedVideo = videoHistory.splice(videoIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedVideo,
      message: 'Video deleted from history'
    });
  } catch (error) {
    console.error('Error deleting video from history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete video from history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}