import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

const PROJECT_INCLUDE = {
  company: { select: { id: true, name: true } },
  tasks: {
    include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { tasks: true } },
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.project.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  create(dto: CreateProjectDto) {
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.project.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  // Tasks
  async createTask(projectId: string, dto: CreateTaskDto) {
    await this.findOne(projectId);
    const { dueDate, ...rest } = dto;
    return this.prisma.task.create({
      data: { ...rest, projectId, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async updateTask(projectId: string, taskId: string, dto: UpdateTaskDto) {
    const { dueDate, ...rest } = dto;
    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async removeTask(projectId: string, taskId: string) {
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
