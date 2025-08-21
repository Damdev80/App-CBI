import { z } from 'zod';

export const CreateIdSchema = z.object({
  id: z.uuid(),
});
