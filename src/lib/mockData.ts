import { Student, Teacher, Class, Result } from '@/types';

// Classes with arms
export const mockClasses: Class[] = [
  { id: '1', name: 'JSS 1', arms: ['A', 'B', 'C'] },
  { id: '2', name: 'JSS 2', arms: ['A', 'B', 'C'] },
  { id: '3', name: 'SS 1', arms: ['A', 'B'] },
  { id: '4', name: 'SS 2', arms: ['A', 'B'] },
  { id: '5', name: 'SS 3', arms: ['A'] },
];

// Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 't1',
    name: 'Mr. John Okonkwo',
    email: 'john.okonkwo@school.com',
    password: 'password',
    role: 'teacher',
    teacherId: 'TCH001',
    classIds: ['JSS 1', 'SS 1'],
  },
  {
    id: 't2',
    name: 'Mrs. Grace Adebayo',
    email: 'grace.adebayo@school.com',
    password: 'password',
    role: 'teacher',
    teacherId: 'TCH002',
    classIds: ['JSS 2', 'SS 2'],
  },
];

// Students
export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Chidi Obi',
    email: 'chidi.obi@school.com',
    password: 'password',
    role: 'student',
    studentId: 'STU001',
    dateOfBirth: '2010-05-15',
    classId: '1',
    arm: 'A',
  },
  {
    id: 's2',
    name: 'Amina Suleiman',
    email: 'amina.suleiman@school.com',
    password: 'password',
    role: 'student',
    studentId: 'STU002',
    dateOfBirth: '2011-08-22',
    classId: '1',
    arm: 'A',
  },
  {
    id: 's3',
    name: 'Emeka Okafor',
    email: 'emeka.okafor@school.com',
    password: 'password',
    role: 'student',
    studentId: 'STU003',
    dateOfBirth: '2010-11-03',
    classId: '1',
    arm: 'B',
  },
];

// Results
export const mockResults: Result[] = [
  {
    id: 'r1',
    studentId: 's1',
    studentName: 'Chidi Obi',
    className: 'JSS 1',
    arm: 'A',
    term: 'first',
    session: '2024/2025',
    subjects: [
      { name: 'Mathematics', ca1: 18, ca2: 19, exam: 55, total: 92, grade: 'A', remark: 'Excellent' },
      { name: 'English', ca1: 15, ca2: 16, exam: 48, total: 79, grade: 'A', remark: 'Excellent' },
      { name: 'Physics', ca1: 17, ca2: 18, exam: 50, total: 85, grade: 'A', remark: 'Excellent' },
    ],
    submittedBy: 't1',
    submittedAt: new Date('2024-02-15'),
  },
  {
    id: 'r2',
    studentId: 's2',
    studentName: 'Amina Suleiman',
    className: 'JSS 1',
    arm: 'A',
    term: 'first',
    session: '2024/2025',
    subjects: [
      { name: 'Mathematics', ca1: 14, ca2: 15, exam: 42, total: 71, grade: 'B', remark: 'Very Good' },
      { name: 'English', ca1: 16, ca2: 17, exam: 45, total: 78, grade: 'A', remark: 'Excellent' },
    ],
    submittedBy: 't1',
    submittedAt: new Date('2024-02-15'),
  },
];

// Admin
export const adminUser = {
  id: 'a1',
  name: 'Admin User',
  email: 'admin@school.com',
  password: 'admin123',
  role: 'admin',
};