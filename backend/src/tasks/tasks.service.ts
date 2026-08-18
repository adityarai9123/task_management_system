import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  // Get all tasks
  async findAll() {
    return this.taskModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  // Create a task
  async create(taskData: CreateTaskDto) {
    const task = new this.taskModel(taskData);
    return task.save();
  }

  // Update a task
  async update(id: string, taskData: UpdateTaskDto) {
    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        taskData,
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  // Delete a task
  async delete(id: string) {
    const task = await this.taskModel
      .findByIdAndDelete(id)
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      message: 'Task deleted successfully',
    };
  }
}