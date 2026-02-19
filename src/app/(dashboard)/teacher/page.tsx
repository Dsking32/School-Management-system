'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  BookOpen, 
  Users, 
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Calculator
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  arms: string[];
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
}

interface SubjectScore {
  id: string;
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
}

interface SubmittedResult {
  id: string;
  studentName: string;
  className: string;
  arm: string;
  term: string;
  session: string;
  totalScore: number;
  status: string;
  submittedAt: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Teacher data
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submittedResults, setSubmittedResults] = useState<SubmittedResult[]>([]);
  
  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedArm, setSelectedArm] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Scores state
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [currentSession] = useState('2024/2025');
  const [currentTerm] = useState('first');

  // Load teacher data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchAssignments();
      fetchSubmittedResults();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedClass && selectedArm) {
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedClass, selectedArm]);

  useEffect(() => {
    if (selectedStudent) {
      initializeScores();
    }
  }, [selectedStudent]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments');
      const data = await res.json();
      setAssignedClasses(data);
    } catch (error) {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/teacher/students?classId=${selectedClass}&arm=${selectedArm}`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchSubmittedResults = async () => {
    try {
      const res = await fetch('/api/teacher/results');
      const data = await res.json();
      setSubmittedResults(data);
    } catch (error) {
      toast.error('Failed to fetch submitted results');
    }
  };

  const initializeScores = () => {
    const currentClass = assignedClasses.find(c => c.id === selectedClass);
    if (currentClass) {
      const initialScores = currentClass.subjects.map(subj => ({
        id: subj.id,
        name: subj.name,
        ca1: 0,
        ca2: 0,
        exam: 0,
        total: 0,
        grade: 'F'
      }));
      setSubjects(initialScores);
    }
  };

  const handleScoreChange = (subjectId: string, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    const numValue = parseInt(value) || 0;
    const maxValues = { ca1: 20, ca2: 20, exam: 60 };
    
    if (numValue > maxValues[field]) {
      toast.error(`${field.toUpperCase()} cannot exceed ${maxValues[field]}`);
      return;
    }

    setSubjects(prev => {
      const updated = prev.map(subj => {
        if (subj.id === subjectId) {
          const newSubj = { ...subj, [field]: numValue };
          // Calculate total and grade
          newSubj.total = newSubj.ca1 + newSubj.ca2 + newSubj.exam;
          newSubj.grade = calculateGrade(newSubj.total);
          return newSubj;
        }
        return subj;
      });
      return updated;
    });
  };

  const calculateGrade = (total: number): string => {
    if (total >= 75) return 'A';
    if (total >= 65) return 'B';
    if (total >= 55) return 'C';
    if (total >= 45) return 'D';
    return 'F';
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    // Validate all subjects have scores
    const invalidSubjects = subjects.filter(s => s.total === 0);
    if (invalidSubjects.length > 0) {
      toast.error('Please enter scores for all subjects');
      return;
    }

    setSubmitting(true);

    const totalScore = subjects.reduce((sum, s) => sum + s.total, 0);
    const averageScore = totalScore / subjects.length;

    try {
      const res = await fetch('/api/teacher/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          classId: selectedClass,
          arm: selectedArm,
          term: currentTerm,
          session: currentSession,
          subjects: subjects.map(s => ({
            name: s.name,
            ca1: s.ca1,
            ca2: s.ca2,
            exam: s.exam,
            total: s.total,
            grade: s.grade
          })),
          totalScore,
          averageScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit result');
      }

      toast.success('Result submitted successfully (Pending Approval)');
      
      // Reset form
      setSelectedStudent('');
      setSelectedArm('');
      setSelectedClass('');
      setSubjects([]);
      
      // Refresh submitted results
      fetchSubmittedResults();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </span>;
      case 'APPROVED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Approved
        </span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Rejected
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedClassData = assignedClasses.find(c => c.id === selectedClass);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-blue-100 mt-2">
                Welcome, {session?.user?.name || 'Teacher'}
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Result Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Class */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h2 className="text-xl font-semibold">Select Class & Arm</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedArm('');
                      setSelectedStudent('');
                    }}
                  >
                    <option value="">Select a class</option>
                    {assignedClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arm
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedArm}
                    onChange={(e) => {
                      setSelectedArm(e.target.value);
                      setSelectedStudent('');
                    }}
                    disabled={!selectedClass}
                  >
                    <option value="">Select an arm</option>
                    {selectedClassData?.arms.map(arm => (
                      <option key={arm} value={arm}>Arm {arm}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Select Student */}
            {selectedClass && selectedArm && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h2 className="text-xl font-semibold">Select Student</h2>
                </div>

                <div>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Choose a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {students.length} students in this class
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Enter Scores */}
            {selectedStudent && subjects.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h2 className="text-xl font-semibold">Enter Scores</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Subject</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">CA 1 (20)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">CA 2 (20)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Exam (60)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Total</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {subjects.map((subject) => (
                        <tr key={subject.id}>
                          <td className="px-4 py-3 font-medium">{subject.name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={subject.ca1 || ''}
                              onChange={(e) => handleScoreChange(subject.id, 'ca1', e.target.value)}
                              className="w-16 text-center border rounded-lg px-2 py-1 mx-auto block focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={subject.ca2 || ''}
                              onChange={(e) => handleScoreChange(subject.id, 'ca2', e.target.value)}
                              className="w-16 text-center border rounded-lg px-2 py-1 mx-auto block focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={subject.exam || ''}
                              onChange={(e) => handleScoreChange(subject.id, 'exam', e.target.value)}
                              className="w-16 text-center border rounded-lg px-2 py-1 mx-auto block focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{subject.total}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              subject.grade === 'A' ? 'bg-green-100 text-green-700' :
                              subject.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                              subject.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              subject.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {subject.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Step 4: Submit */}
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <h2 className="text-xl font-semibold">Submit for Approval</h2>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Result'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recent Submissions */}
          <div className="space-y-6">
            {/* Teacher Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Current Session
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session:</span>
                  <span className="font-medium">{currentSession}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-medium capitalize">{currentTerm} Term</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assigned Classes:</span>
                  <span className="font-medium">{assignedClasses.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Submissions
              </h3>
              
              {submittedResults.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No results submitted yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submittedResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{result.studentName}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {result.className} {result.arm} • {result.term} term
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}