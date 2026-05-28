import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  @Get()    list(@Query('status') status?: string)               { return this.svc.findAll(status); }
  @Get(':id') get(@Param('id') id: string)                       { return this.svc.findOne(id); }
  @Post()   create(@Body() dto: CreateProjectDto)                { return this.svc.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string)                 { return this.svc.remove(id); }

  @Post(':id/tasks')    createTask(@Param('id') id: string, @Body() dto: CreateTaskDto) { return this.svc.createTask(id, dto); }
  @Put(':id/tasks/:tid') updateTask(@Param('id') id: string, @Param('tid') tid: string, @Body() dto: UpdateTaskDto) { return this.svc.updateTask(id, tid, dto); }
  @Delete(':id/tasks/:tid') removeTask(@Param('id') id: string, @Param('tid') tid: string) { return this.svc.removeTask(id, tid); }
}
