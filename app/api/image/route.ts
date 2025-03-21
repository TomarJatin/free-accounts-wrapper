import { NextResponse } from 'next/server';
import { ServiceManager } from '@/lib/services/service-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const service = await ServiceManager.getLeastUsedImageService();
    
    if (!service) {
      return NextResponse.json(
        { error: 'No available image generation services' },
        { status: 503 }
      );
    }

    const response = await fetch(service.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    
    // Increment the counter after successful generation
    await ServiceManager.incrementCounter(service.id, 'image');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 