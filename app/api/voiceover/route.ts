import { NextResponse } from 'next/server';
import { ServiceManager } from '@/lib/services/service-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const service = await ServiceManager.getLeastUsedVoiceoverService();
    
    if (!service) {
      return NextResponse.json(
        { error: 'No available voiceover services' },
        { status: 503 }
      );
    }

    const response = await fetch(service.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate voiceover');
    }

    const data = await response.json();
    
    // Increment the counter after successful generation
    await ServiceManager.incrementCounter(service.id, 'voiceover');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating voiceover:', error);
    return NextResponse.json(
      { error: 'Failed to generate voiceover' },
      { status: 500 }
    );
  }
} 