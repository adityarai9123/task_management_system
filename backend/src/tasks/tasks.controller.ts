import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { Task } from './task.schema';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() taskData: Partial<Task>) {
    return this.tasksService.create(taskData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() taskData: Partial<Task>,
  ) {
    return this.tasksService.update(id, taskData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}