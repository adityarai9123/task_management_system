import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: true })
export class Subtask {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    enum: ['No Priority', 'Low', 'Medium', 'High', 'Urgent'],
    default: 'No Priority',
  })
  priority!: string;

  @Prop()
  projectId?: string;

  @Prop({ default: 'Guest User' })
  assignee!: string;

  @Prop()
  dueDate?: string;

  @Prop({ default: false })
  completed!: boolean;
}

@Schema({ _id: true })
export class TaskComment {
  @Prop({ required: true, trim: true, maxlength: 2000 })
  text!: string;

  @Prop({ default: 'Guest User' })
  author!: string;

  @Prop()
  parentId?: string;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);
export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({
    enum: ['To Do', 'Doing', 'Completed', 'On Hold', 'Backlog'],
    default: 'To Do',
  })
  status!: string;

  @Prop({
    enum: ['No Priority', 'Low', 'Medium', 'High', 'Urgent'],
    default: 'No Priority',
  })
  priority!: string;

  @Prop()
  dueDate?: string;

  @Prop({ type: [String], default: [] })
  labels!: string[];

  @Prop({ type: [String], default: [] })
  teams!: string[];

  @Prop({ type: [String], default: [] })
  resources!: string[];

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks!: Subtask[];

  @Prop({ type: [TaskCommentSchema], default: [] })
  comments!: TaskComment[];

  @Prop()
  projectId?: string;

  @Prop({ default: 'Guest User' })
  assignee!: string;

  @Prop({ default: 'Guest User' })
  reporter!: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
