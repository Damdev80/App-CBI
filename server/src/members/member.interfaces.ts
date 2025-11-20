import type { IUser } from 'src/users/intefaces/user.interfaces';
import type { IGroup } from 'src/groups/group.interfaces';
import type { LevelDicipules } from '@prisma/client';

export interface IMembers {
  id: string;
  userId: string;
  user?: IUser | null;
  groupId: string;
  group?: IGroup | null;
  levelDicipules: LevelDicipules;
  joinedAt: Date;
}