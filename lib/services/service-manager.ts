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

type Service = {
  id: string;
  apiUrl: string;
  counter: number;
  limit: number;
  lastResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class ServiceManager {
  private static isMonthPassed(lastResetDate: Date): boolean {
    const now = new Date();
    return (
      now.getFullYear() !== lastResetDate.getFullYear() ||
      now.getMonth() !== lastResetDate.getMonth()
    );
  }

  private static async resetCounterIfNeeded(service: Service, serviceType: 'voiceover' | 'image') {
    if (this.isMonthPassed(service.lastResetDate)) {
      if (serviceType === 'voiceover') {
        return prisma.voiceoverService.update({
          where: { id: service.id },
          data: {
            counter: 0,
            lastResetDate: new Date(),
          },
        });
      } else {
        return prisma.imageGenerationService.update({
          where: { id: service.id },
          data: {
            counter: 0,
            lastResetDate: new Date(),
          },
        });
      }
    }
    return service;
  }

  static async addServiceInstances(instances: ServiceInstance[]) {
    const results = await Promise.all(
      instances.map(async (instance) => {
        if (instance.serviceType === 'voiceover') {
          return prisma.voiceoverService.create({
            data: {
              apiUrl: instance.apiUrl,
              limit: instance.limit,
              lastResetDate: new Date(),
            },
          });
        } else {
          return prisma.imageGenerationService.create({
            data: {
              apiUrl: instance.apiUrl,
              limit: instance.limit,
              lastResetDate: new Date(),
            },
          });
        }
      })
    );
    return results;
  }

  static async getLeastUsedVoiceoverService() {
    const service = await prisma.voiceoverService.findFirst({
      where: {
        counter: {
          lt: prisma.voiceoverService.fields.limit,
        },
      },
      orderBy: {
        counter: 'asc',
      },
    });

    if (service) {
      return this.resetCounterIfNeeded(service, 'voiceover');
    }
    return null;
  }

  static async getLeastUsedImageService() {
    const service = await prisma.imageGenerationService.findFirst({
      where: {
        counter: {
          lt: prisma.imageGenerationService.fields.limit,
        },
      },
      orderBy: {
        counter: 'asc',
      },
    });

    if (service) {
      return this.resetCounterIfNeeded(service, 'image');
    }
    return null;
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
    const services = serviceType === 'voiceover'
      ? await prisma.voiceoverService.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        })
      : await prisma.imageGenerationService.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });

    // Reset counters for all services if needed
    return Promise.all(
      services.map((service: Service) => this.resetCounterIfNeeded(service, serviceType))
    );
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