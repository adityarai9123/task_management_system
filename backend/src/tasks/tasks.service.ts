import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './task.schema';

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
  async create(taskData: Partial<Task>) {
    const task = new this.taskModel(taskData);
    return task.save();
  }

  // Update a task
  async update(id: string, taskData: Partial<Task>) {
    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        taskData,
        {
          new: true,
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