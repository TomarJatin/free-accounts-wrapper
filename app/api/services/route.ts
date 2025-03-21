import { NextResponse } from 'next/server';
import { ServiceManager } from '@/lib/services/service-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type || !['voiceover', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid service type is required' },
        { status: 400 }
      );
    }

    const services = await ServiceManager.getAllServices(type as 'voiceover' | 'image');
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instances } = body;

    if (!Array.isArray(instances)) {
      return NextResponse.json(
        { error: 'Instances must be an array' },
        { status: 400 }
      );
    }

    const results = await ServiceManager.addServiceInstances(instances);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error adding service instances:', error);
    return NextResponse.json(
      { error: 'Failed to add service instances' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();
    const { serviceId, updateData } = body;

    if (!type || !['voiceover', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid service type is required' },
        { status: 400 }
      );
    }

    if (!serviceId || !updateData) {
      return NextResponse.json(
        { error: 'Service ID and update data are required' },
        { status: 400 }
      );
    }

    const updatedService = await ServiceManager.updateService(
      serviceId,
      type as 'voiceover' | 'image',
      updateData
    );

    return NextResponse.json({ success: true, data: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const serviceId = searchParams.get('serviceId');

    if (!type || !['voiceover', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid service type is required' },
        { status: 400 }
      );
    }

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    await ServiceManager.deleteService(serviceId, type as 'voiceover' | 'image');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
} 