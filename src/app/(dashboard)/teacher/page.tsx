'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  BookOpen, 
  Users, 
  Save,
  CheckCircle,
  Clock
} from 'lucide-react';
import { mockTeachers, mockStudents, mockClasses } from '@/lib/mockData';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [selectedArm, setSelectedArm] = useState('A');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scores, setScores] = useState({
    mathematics: { ca1: 0, ca2: 0, exam: 0 },
    english: { ca1: 0, ca2: 0, exam: 0 },
    physics: { ca1: 0, ca2: 0, exam: 0 }
  });
  const [submittedResults, setSubmittedResults] = useState<any[]>([]);

  useEffect(() => {
    // For demo, use first teacher (Mr. John Okonkwo)
    const currentTeacher = mockTeachers[0];
    setTeacher(currentTeacher);
    
    // Get the class assigned to this teacher (first one)
    if (currentTeacher.classIds.length > 0) {
      const className = currentTeacher.classIds[0]; // "JSS 1"
      const classData = mockClasses.find(c => c.name === className);
      setAssignedClass(classData);
    }
  }, []);

  // Update students when arm changes
  useEffect(() => {
    if (assignedClass && teacher) {
      const classStudents = mockStudents.filter(s => 
        s.classId === assignedClass.id && s.arm === selectedArm
      );
      setStudents(classStudents);
    }
  }, [assignedClass, selectedArm, teacher]);

  const handleScoreChange = (
    subject: 'mathematics' | 'english' | 'physics',
    field: 'ca1' | 'ca2' | 'exam',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    const maxValues = { ca1: 20, ca2: 20, exam: 60 };
    
    if (numValue > maxValues[field]) {
      toast.error(`${field.toUpperCase()} cannot exceed ${maxValues[field]}`);
      return;
    }

    setScores(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: numValue
      }
    }));
  };

  const calculateTotal = (subject: any) => {
    return subject.ca1 + subject.ca2 + subject.exam;
  };

  const calculateGrade = (total: number) => {
    if (total >= 75) return 'A';
    if (total >= 65) return 'B';
    if (total >= 55) return 'C';
    if (total >= 45) return 'D';
    return 'F';
  };

  const handleSubmit = () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    
    // Create result object
    const result = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      studentName: student?.name,
      className: assignedClass?.name,
      arm: selectedArm,
      term: 'first',
      session: '2024/2025',
      subjects: [
        {
          name: 'Mathematics',
          ...scores.mathematics,
          total: calculateTotal(scores.mathematics),
          grade: calculateGrade(calculateTotal(scores.mathematics))
        },
        {
          name: 'English',
          ...scores.english,
          total: calculateTotal(scores.english),
          grade: calculateGrade(calculateTotal(scores.english))
        },
        {
          name: 'Physics',
          ...scores.physics,
          total: calculateTotal(scores.physics),
          grade: calculateGrade(calculateTotal(scores.physics))
        }
      ],
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      submittedBy: teacher?.name
    };

    // Add to submitted results list
    setSubmittedResults(prev => [result, ...prev]);
    
    // Reset form
    setSelectedStudent('');
    setScores({
      mathematics: { ca1: 0, ca2: 0, exam: 0 },
      english: { ca1: 0, ca2: 0, exam: 0 },
      physics: { ca1: 0, ca2: 0, exam: 0 }
    });

    toast.success(`Result submitted for ${student?.name} (Pending Approval)`);
  };

  if (!teacher) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Teacher Portal</h1>
              <p className="text-blue-100">{teacher.name} ({teacher.teacherId})</p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: See Assigned Class */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h2 className="text-xl font-semibold">Your Assigned Class</h2>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-lg font-medium text-blue-800">
              {assignedClass?.name || 'No class assigned'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Academic Year: 2024/2025 | Term: First Term
            </p>
          </div>
        </div>

        {/* Step 2: See Students */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold">Select Arm & Student</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Arm</label>
              <select 
                className="w-full border rounded-lg px-3 py-2"
                value={selectedArm}
                onChange={(e) => setSelectedArm(e.target.value)}
              >
                <option value="A">Arm A</option>
                <option value="B">Arm B</option>
                <option value="C">Arm C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
              <select 
                className="w-full border rounded-lg px-3 py-2"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Choose a student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{students.length} students in {assignedClass?.name} {selectedArm}</span>
          </div>
        </div>

        {/* Step 3: Input Scores */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h2 className="text-xl font-semibold">Enter Scores</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left">Subject</th>
                    <th className="border p-3">CA 1 (20)</th>
                    <th className="border p-3">CA 2 (20)</th>
                    <th className="border p-3">Exam (60)</th>
                    <th className="border p-3">Total</th>
                    <th className="border p-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mathematics */}
                  <tr>
                    <td className="border p-3 font-medium">Mathematics</td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.mathematics.ca1 || ''}
                        onChange={(e) => handleScoreChange('mathematics', 'ca1', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.mathematics.ca2 || ''}
                        onChange={(e) => handleScoreChange('mathematics', 'ca2', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="60"
                        value={scores.mathematics.exam || ''}
                        onChange={(e) => handleScoreChange('mathematics', 'exam', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3 text-center font-medium">
                      {calculateTotal(scores.mathematics)}
                    </td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${calculateGrade(calculateTotal(scores.mathematics)) === 'A' ? 'bg-green-100 text-green-800' : ''}
                        ${calculateGrade(calculateTotal(scores.mathematics)) === 'B' ? 'bg-blue-100 text-blue-800' : ''}
                        ${calculateGrade(calculateTotal(scores.mathematics)) === 'C' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${calculateGrade(calculateTotal(scores.mathematics)) === 'D' ? 'bg-orange-100 text-orange-800' : ''}
                        ${calculateGrade(calculateTotal(scores.mathematics)) === 'F' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {calculateGrade(calculateTotal(scores.mathematics))}
                      </span>
                    </td>
                  </tr>

                  {/* English */}
                  <tr>
                    <td className="border p-3 font-medium">English</td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.english.ca1 || ''}
                        onChange={(e) => handleScoreChange('english', 'ca1', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.english.ca2 || ''}
                        onChange={(e) => handleScoreChange('english', 'ca2', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="60"
                        value={scores.english.exam || ''}
                        onChange={(e) => handleScoreChange('english', 'exam', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3 text-center font-medium">
                      {calculateTotal(scores.english)}
                    </td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${calculateGrade(calculateTotal(scores.english)) === 'A' ? 'bg-green-100 text-green-800' : ''}
                        ${calculateGrade(calculateTotal(scores.english)) === 'B' ? 'bg-blue-100 text-blue-800' : ''}
                        ${calculateGrade(calculateTotal(scores.english)) === 'C' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${calculateGrade(calculateTotal(scores.english)) === 'D' ? 'bg-orange-100 text-orange-800' : ''}
                        ${calculateGrade(calculateTotal(scores.english)) === 'F' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {calculateGrade(calculateTotal(scores.english))}
                      </span>
                    </td>
                  </tr>

                  {/* Physics */}
                  <tr>
                    <td className="border p-3 font-medium">Physics</td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.physics.ca1 || ''}
                        onChange={(e) => handleScoreChange('physics', 'ca1', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="20"
                        value={scores.physics.ca2 || ''}
                        onChange={(e) => handleScoreChange('physics', 'ca2', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3">
                      <input 
                        type="number"
                        min="0"
                        max="60"
                        value={scores.physics.exam || ''}
                        onChange={(e) => handleScoreChange('physics', 'exam', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="border p-3 text-center font-medium">
                      {calculateTotal(scores.physics)}
                    </td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${calculateGrade(calculateTotal(scores.physics)) === 'A' ? 'bg-green-100 text-green-800' : ''}
                        ${calculateGrade(calculateTotal(scores.physics)) === 'B' ? 'bg-blue-100 text-blue-800' : ''}
                        ${calculateGrade(calculateTotal(scores.physics)) === 'C' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${calculateGrade(calculateTotal(scores.physics)) === 'D' ? 'bg-orange-100 text-orange-800' : ''}
                        ${calculateGrade(calculateTotal(scores.physics)) === 'F' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {calculateGrade(calculateTotal(scores.physics))}
                      </span>
                    </td>
                  </tr>
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Submit Result (Status: Pending Approval)
              </button>
            </div>
          </div>
        )}

        {/* Recently Submitted Results */}
        {submittedResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recently Submitted Results (Pending)
            </h3>
            
            <div className="space-y-3">
              {submittedResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{result.studentName}</p>
                      <p className="text-sm text-gray-600">
                        {result.className} {result.arm} • {result.term} term {result.session}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {result.submittedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}