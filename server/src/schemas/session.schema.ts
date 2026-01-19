import { z } from 'zod';

export const CreateSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime().optional(), // o z.string().optional() si recibes ISO string
  groupId: z.string().uuid(),
});
