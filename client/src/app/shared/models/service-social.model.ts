export interface Teacher {
  id: string;
  name: string;
  number?: string;
  GoToCampement: boolean;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  students?: UserServiceSocial[];
}

export interface UserServiceSocial {
  id: string;
  name: string;
  number?: string;
  GoToCampement: boolean;
  attendance: boolean;
  Gender: 'MASCULINO' | 'FEMENINO';
  Documents?: string;
  payGotoCampement: 'PAGO' | 'DEBE';
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  School?: Teacher;
}
