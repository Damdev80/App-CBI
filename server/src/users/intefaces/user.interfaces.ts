export interface IUser {
  id: string;
  name: string | null;
  number: string | null;
  email: string;
  password: string | null;
  age: number | null;
  address: string | null;
  happybirth: Date | null;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
