import { prisma } from '../prisma';

interface ServiceInstance {
  apiUrl: string;
  limit: number;
  serviceType: 'voiceover' | 'image';
}

interface UpdateServiceInstance {
  apiUrl?: string;
  limit?: number;
}

export class ServiceManager {
  static async addServiceInstances(instances: ServiceInstance[]) {
    const results = await Promise.all(
      instances.map(async (instance) => {
        if (instance.serviceType === 'voiceover') {
          return prisma.voiceoverService.create({
            data: {
              apiUrl: instance.apiUrl,
              limit: instance.limit,
            },
          });
        } else {
          return prisma.imageGenerationService.create({
            data: {
              apiUrl: instance.apiUrl,
              limit: instance.limit,
            },
          });
        }
      })
    );
    return results;
  }

  static async getLeastUsedVoiceoverService() {
    return prisma.voiceoverService.findFirst({
      where: {
        counter: {
          lt: prisma.voiceoverService.fields.limit,
        },
      },
      orderBy: {
        counter: 'asc',
      },
    });
  }

  static async getLeastUsedImageService() {
    return prisma.imageGenerationService.findFirst({
      where: {
        counter: {
          lt: prisma.imageGenerationService.fields.limit,
        },
      },
      orderBy: {
        counter: 'asc',
      },
    });
  }

  static async incrementCounter(serviceId: string, serviceType: 'voiceover' | 'image') {
    if (serviceType === 'voiceover') {
      return prisma.voiceoverService.update({
        where: { id: serviceId },
        data: { counter: { increment: 1 } },
      });
    } else {
      return prisma.imageGenerationService.update({
        where: { id: serviceId },
        data: { counter: { increment: 1 } },
      });
    }
  }

  static async getAllServices(serviceType: 'voiceover' | 'image') {
    if (serviceType === 'voiceover') {
      return prisma.voiceoverService.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      return prisma.imageGenerationService.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  }

  static async updateService(
    serviceId: string,
    serviceType: 'voiceover' | 'image',
    updateData: UpdateServiceInstance
  ) {
    if (serviceType === 'voiceover') {
      return prisma.voiceoverService.update({
        where: { id: serviceId },
        data: updateData,
      });
    } else {
      return prisma.imageGenerationService.update({
        where: { id: serviceId },
        data: updateData,
      });
    }
  }

  static async deleteService(serviceId: string, serviceType: 'voiceover' | 'image') {
    if (serviceType === 'voiceover') {
      return prisma.voiceoverService.delete({
        where: { id: serviceId },
      });
    } else {
      return prisma.imageGenerationService.delete({
        where: { id: serviceId },
      });
    }
  }
} 