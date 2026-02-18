export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Student extends User {
  role: 'student';
  studentId: string; // School number
  dateOfBirth: string;
  classId: string;
  arm: 'A' | 'B' | 'C';
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  classIds: string[]; // Classes they teach (e.g., ["JSS1", "SS2"])
}

export interface Class {
  id: string;
  name: string; // e.g., "JSS 1", "SS 2"
  arms: ('A' | 'B' | 'C')[];
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  className: string; // e.g., "JSS 1"
  arm: 'A' | 'B' | 'C';
  term: 'first' | 'second' | 'third';
  session: string; // e.g., "2024/2025"
  subjects: {
    name: string;
    ca1: number;
    ca2: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
  }[];
  submittedBy: string; // teacherId
  submittedAt: Date;
  lastModifiedBy?: string; // adminId if edited
  lastModifiedAt?: Date;
}