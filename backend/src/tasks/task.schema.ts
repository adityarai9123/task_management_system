import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

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

  @Prop({ default: 'Guest User' })
  assignee!: string;

  @Prop({ default: 'Guest User' })
  reporter!: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);