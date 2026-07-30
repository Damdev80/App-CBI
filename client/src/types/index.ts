// Enums
export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export enum Dicipules {
  SI = 'SI',
  NO = 'NO',
}

export enum LevelDicipules {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export enum WayPay {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum Pay {
  PAGO = 'PAGO',
  DEBE = 'DEBE',
}

export enum Role {
  USER = 'USER',
  LIDER = 'LIDER',
  LIDER_GRUPO = 'LIDER_GRUPO',
  SEMI_ADMIN = 'SEMI_ADMIN',
  CONTADORA = 'CONTADORA',
  SERVIDOR = 'SERVIDOR',
  ADMIN = 'ADMIN',
}

export enum GroupRole {
  LIDER_CABEZA = 'LIDER_CABEZA',
  LIDER = 'LIDER',
  MIEMBRO = 'MIEMBRO',
}

export enum EventType {
  EVENTO = 'EVENTO',
  ACTIVIDAD = 'ACTIVIDAD',
  REUNION = 'REUNION',
}

// Models
export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  number?: string | null;
  password?: string | null;
  happybirth?: Date | null;
  gender?: Gender | null;
  isActive: boolean;
  baptized: boolean;
  dicipules: Dicipules;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  address?: string | null;
  age?: number | null;
  hobbies?: string | null;
  dreams?: string | null;
  job?: string | null;
  vulnerable_area?: string | null;
}

export interface Groups {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Members {
  id: string;
  userId: string;
  user?: User;
  groupId: string;
  group?: Groups;
  levelDicipules: LevelDicipules;
  groupRole: GroupRole;
  joinedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  eventType: EventType;
  hasPrice: boolean;
  priceTier: number;
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersEvent {
  id: string;
  userId?: string | null;
  eventId: string;
  name: string;
  email: string;
  dateBorn: Date;
  wayPay?: WayPay | null;
  phone?: string | null;
  paymentAmount: number;
  payStatus: Pay;
  createdAt: Date;
  hasSiblings: boolean;
  user?: User | null;
  event?: Event;
}

export interface Session {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  groupId: string;
  group?: Groups;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  groupId: string;
  group?: Groups;
  title: string;
  content: string;
  authorId?: string | null;
  authorName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupJoinRequest {
  id: string;
  groupName: string;
  name: string;
  phone: string;
  message?: string | null;
  status: string;
  createdAt: Date;
}

export interface TeachersService {
  id: string;
  name: string;
  number?: string | null;
  GoToCampement: boolean;
  createdAt: Date;
  updatedAt: Date;
  teacherId: string;
}

export interface StudentTeacher {
  id: string;
  studentId: string;
  teacherId: string;
  student?: UserServiceSocial;
  teacher?: TeachersService;
  createdAt: Date;
}

export interface StudentGroup {
  id: string;
  name: string;
  number?: string | null;
  teacherId?: string | null;
  teacher?: TeachersService | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserServiceSocial {
  id: string;
  name: string;
  number?: string | null;
  GoToCampement: boolean;
  createdAt: Date;
  updatedAt: Date;
  Gender: Gender;
  Documents?: string | null;
  payGotoCampement: Pay;
  groupId?: string | null;
  group?: StudentGroup | null;
  teacherId?: string | null;
  School?: TeachersService | null;
  studentTeachers?: StudentTeacher[];
  attendanceRecords?: AttendanceRecord[];
  moneyCollections?: MoneyCollection[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  student?: UserServiceSocial;
  date: Date;
  present: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoneyCollection {
  id: string;
  date: Date;
  amount: number;
  studentId: string;
  student?: UserServiceSocial;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface PreRegisterRequest {
  name: string;
  sexo: string;
  number: string;
  address: string;
  baptized: boolean;
  group?: string;
  happybirth: string;
}

export interface ProfileResponse extends User {
  members?: Members[];
}

export interface DashboardStats {
  role: Role;
  scope: string[];
  groups: string[];
  modules: string[];
  kpis: Record<string, number>;
}

export interface AdminStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  semis: number;
  leaders: number;
  accountants: number;
}

export interface DebtStatus {
  studentId: string;
  name: string;
  number: string | null;
  group: string | null;
  expectedAmount: number;
  totalPaid: number;
  debt: number;
  status: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  role: Role;
  exp?: number;
  iat?: number;
}
