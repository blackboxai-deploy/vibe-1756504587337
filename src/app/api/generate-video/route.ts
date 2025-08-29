import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, duration = 5, aspectRatio = '16:9', quality = 'standard', systemPrompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const videoGenerationPayload = {
      model: 'replicate/google/veo-3',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are an AI video generation assistant. Create high-quality videos based on user prompts with attention to detail, smooth motion, and cinematic quality.'
        },
        {
          role: 'user',
          content: `Generate a ${duration}-second video with ${aspectRatio} aspect ratio and ${quality} quality: ${prompt}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: false,
      video_generation: true,
      parameters: {
        duration: duration,
        aspect_ratio: aspectRatio,
        quality: quality,
        fps: 24
      }
    };

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
        'CustomerId': 'cus_STdieAQZHdsbuQ'
      },
      body: JSON.stringify(videoGenerationPayload),
      signal: AbortSignal.timeout(900000) // 15 minutes timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Video generation API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate video', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Generate a unique ID for this generation
    const generationId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store generation info in response
    const videoData = {
      id: generationId,
      prompt: prompt,
      duration: duration,
      aspectRatio: aspectRatio,
      quality: quality,
      status: 'completed',
      videoUrl: result.choices?.[0]?.message?.content || result.video_url || result.url,
      createdAt: new Date().toISOString(),
      metadata: {
        model: 'replicate/google/veo-3',
        parameters: {
          duration,
          aspectRatio,
          quality
        }
      }
    };

    return NextResponse.json(videoData);

  } catch (error: any) {
    console.error('Video generation error:', error);
    
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Video generation timed out. Please try again with a shorter duration.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Generation ID is required' },
      { status: 400 }
    );
  }

  // In a real app, you'd check the status from your database
  // For now, we'll return a mock status response
  return NextResponse.json({
    id: id,
    status: 'completed',
    progress: 100,
    message: 'Video generation completed successfully'
  });
}