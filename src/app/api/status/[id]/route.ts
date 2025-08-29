import { NextRequest, NextResponse } from 'next/server';

interface StatusResponse {
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
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a mock/demo ID
    if (id.startsWith('demo_') || id.startsWith('mock_')) {
      // Return mock status for demo purposes
      const mockStatuses = ['starting', 'processing', 'succeeded'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      
      return NextResponse.json({
        id,
        status: randomStatus,
        progress: randomStatus === 'processing' ? Math.floor(Math.random() * 80) + 10 : 100,
        output: randomStatus === 'succeeded' ? [`https://replicate.delivery/pbxt/demo-video-${id}.mp4`] : null,
        created_at: new Date().toISOString(),
        completed_at: randomStatus === 'succeeded' ? new Date().toISOString() : null
      });
    }

    // Make request to custom API endpoint for status check
    const response = await fetch(`https://oi-server.onrender.com/chat/completions/status/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CustomerId': 'cus_STdieAQZHdsbuQ',
        'Authorization': 'Bearer xxx'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout for status checks
    });

    if (!response.ok) {
      // If status endpoint doesn't exist, try alternative approach
      if (response.status === 404) {
        return NextResponse.json({
          id,
          status: 'processing',
          progress: 50,
          message: 'Generation in progress...'
        });
      }

      throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
    }

    const statusData: StatusResponse = await response.json();

    // Normalize the response format
    const normalizedResponse = {
      id: statusData.id || id,
      status: statusData.status || 'processing',
      progress: statusData.progress || (statusData.status === 'succeeded' ? 100 : 50),
      output: statusData.output,
      error: statusData.error,
      logs: statusData.logs,
      created_at: statusData.created_at,
      completed_at: statusData.completed_at,
      urls: statusData.urls
    };

    return NextResponse.json(normalizedResponse);

  } catch (error) {
    console.error('Status check error:', error);

    // Return a processing status if we can't get the real status
    // This prevents the UI from breaking while generation continues
    return NextResponse.json({
      id: params.id,
      status: 'processing',
      progress: 25,
      message: 'Checking generation status...',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 200 }); // Return 200 to keep polling active
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (action === 'cancel') {
      // Attempt to cancel the generation
      const response = await fetch(`https://oi-server.onrender.com/chat/completions/cancel/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CustomerId': 'cus_STdieAQZHdsbuQ',
          'Authorization': 'Bearer xxx'
        }
      });

      if (response.ok) {
        return NextResponse.json({
          id,
          status: 'canceled',
          message: 'Generation canceled successfully'
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or cancellation failed' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Status action error:', error);
    return NextResponse.json(
      { error: 'Failed to process status action' },
      { status: 500 }
    );
  }
}