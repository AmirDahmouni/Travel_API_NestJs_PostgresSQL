import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { Request, RequestStatus } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) { }

  async getAllRequests(status: RequestStatus): Promise<Request[] | null> {
    return await this.prisma.request.findMany({
      where: { status },
      include: { visitor: true },
    });
  }

  async getRequestById(id: number): Promise<Request | null> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { visitor: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async getRequestsByVisitor(visitorId: number): Promise<Request[] | null> {
    return await this.prisma.request.findMany({
      where: {
        visitorId,
        status: 'approved',
      },
    });
  }

  async removeRequest(id: number): Promise<Request | null> {
    return await this.prisma.request.delete({
      where: { id },
    });
  }

  async applyNewRequest(visitorId: number, data: { visit_to?: string; LTN?: number; date_visit?: Date }): Promise<Request | null> {
    const existingRequest = await this.prisma.request.findMany({
      where: {
        visitorId,
        visit_to: data.visit_to,
        LTN: data.LTN,
        date_visit: data.date_visit,
      },
    });
    if (!existingRequest) return null;
    const newRequest = await this.prisma.request.create({
      data: {
        visitorId,
        visit_to: data.visit_to,
        LTN: data.LTN,
        date_visit: data.date_visit,
      },
    });

    return newRequest;
  }

  async validateRequest(id: number, status: RequestStatus): Promise<Request | null> {
    const request = await this.prisma.request.update({
      where: { id },
      data: { status },
    });
    return request;
  }
}
