import {z} from 'zod';

export const LevelDicipulesEnum = z.enum(['I', 'II', 'III', 'IV']);

export const createMemberSchema = z.object({
    userId: z.string().uuid(),
    groupId: z.string().uuid(),
    levelDicipules: LevelDicipulesEnum,
})

