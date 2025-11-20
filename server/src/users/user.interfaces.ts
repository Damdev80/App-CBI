import type { Gender } from '@prisma/client';
import type { Dicipules } from '@prisma/client';

export interface IUser {
  id: string;
  name: string | null;
  number: string | null;
  email: string;
  password: string | null;
  age: number | null;
  address: string | null;
  dicipules: Dicipules;
  happybirth: Date | null;
  gender: Gender | null;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  service_area: string | null;
  hobbies: string | null;
  dreams: string | null;
  job: string | null;
  vulnerable_area: string | null;
}
