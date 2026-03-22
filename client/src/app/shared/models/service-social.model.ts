export interface Teacher {
  id: string;
  name: string;
  number?: string;
  GoToCampement: boolean;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  students?: UserServiceSocial[];
  _studentCount?: number;
}

export interface StudentGroup {
  id: string;
  name: string;
  number?: string | null;
  teacherId?: string | null;
  teacher?: Teacher;
  students?: UserServiceSocial[];
}

export interface StudentTeacherRef {
  id: string;
  teacherId: string;
  teacher?: Teacher;
}

export interface UserServiceSocial {
  id: string;
  name: string;
  number?: string;
  GoToCampement: boolean;
  Gender: 'MASCULINO' | 'FEMENINO';
  Documents?: string;
  payGotoCampement: 'PAGO' | 'DEBE';
  teacherId?: string | null;
  groupId?: string | null;
  group?: StudentGroup | null;
  studentTeachers?: StudentTeacherRef[];
  createdAt: string;
  updatedAt: string;
  School?: Teacher | null;
}

export interface AttendanceRecordDto {
  id: string;
  name: string;
  number?: string;
  Gender: 'MASCULINO' | 'FEMENINO';
  group: { id: string; name: string } | null;
  present: boolean;
  recordId: string | null;
}

export interface AttendanceHistoryItem {
  date: string;
  present: string[];
  absent: string[];
  students: { id: string; name: string; present: boolean; group: { id: string; name: string } | null }[];
}

export interface MoneyCollection {
  id: string;
  date: string;
  amount: number;
  studentId: string;
  student?: UserServiceSocial;
  notes?: string | null;
  createdAt: string;
}
