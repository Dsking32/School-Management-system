'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Search, Calendar, BookOpen, Award, Users, Download } from 'lucide-react';
import { mockResults, mockStudents, mockClasses } from '@/lib/mockData';
import toast from 'react-hot-toast';

export default function StudentPortal() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedSession, setSelectedSession] = useState('2024/2025');
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  const sessions = ['2024/2025', '2023/2024', '2022/2023'];
  const terms = ['first', 'second', 'third'];

  // Function to convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getPositionInWords = (position: number) => {
    if (position === 1) return '1st Position';
    if (position === 2) return '2nd Position';
    if (position === 3) return '3rd Position';
    return `${position}th Position`;
  };

  // Function to calculate position in class
  const calculatePosition = (studentId: string, classResults: any[]) => {
    // Get all students in same class and sort by total score
    const classScores = classResults
      .filter(r => r.className === results?.className && r.term === selectedTerm)
      .map(r => ({
        studentId: r.studentId,
        total: r.subjects.reduce((sum: number, sub: any) => sum + sub.total, 0)
      }))
      .sort((a, b) => b.total - a.total);
    
    const position = classScores.findIndex(s => s.studentId === studentId) + 1;
    const totalStudents = classScores.length;
    
    return { position, totalStudents, positionWord: getPositionInWords(position) };
  };

  // Function to get class teacher remark based on performance
  const getClassTeacherRemark = (totalScore: number, averageScore: number, position: number) => {
    if (position === 1) return "Excellent performance! You're the best. Keep it up.";
    if (position === 2) return "Very good work. Aim for the top next time.";
    if (position === 3) return "Good effort. You can move higher.";
    if (averageScore >= 65) return "Very good work. Can do even better.";
    if (averageScore >= 55) return "Good result. Put in more effort.";
    if (averageScore >= 45) return "Fair result. Needs improvement.";
    if (averageScore >= 40) return "Below average. Work harder.";
    return "Poor performance. See me immediately.";
  };

  // Function to get principal's remark based on overall performance
  const getPrincipalRemark = (totalScore: number, averageScore: number, position: number) => {
    if (position === 1) return "Promoted to next class with distinction. Excellent!";
    if (position === 2) return "Promoted to next class with merit. Very good.";
    if (position === 3) return "Promoted to next class. Good performance.";
    if (averageScore >= 60) return "Promoted. Very good performance.";
    if (averageScore >= 50) return "Promoted. Can improve.";
    if (averageScore >= 45) return "Promoted on trial. Work harder.";
    return "Not promoted. Repeat class.";
  };

  // Function to get recommendation
  const getRecommendation = (averageScore: number, position: number) => {
    if (position === 1) return "Highly Recommended for Academic Scholarship";
    if (position === 2) return "Recommended for Science/Arts Stream";
    if (position === 3) return "Recommended for Competitive Exams";
    if (averageScore >= 65) return "Recommended for Science/Arts";
    if (averageScore >= 55) return "Recommended for Technical/Vocational";
    if (averageScore >= 45) return "Recommended with Monitoring";
    return "Needs Remedial Classes";
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = mockStudents.find(s => 
      s.studentId === studentId && s.dateOfBirth === dateOfBirth
    );

    if (student) {
      setIsLoggedIn(true);
      setStudentData(student);
      
      const studentResults = mockResults.filter(r => r.studentId === student.id);
      setResults(studentResults);
      
      toast.success('Login successful');
    } else {
      toast.error('Invalid Student ID or Date of Birth');
    }
  };

  const getFilteredResults = () => {
    if (!results) return null;
    return results.find((r: any) => 
      r.term === selectedTerm && r.session === selectedSession
    );
  };

  const filteredResults = getFilteredResults();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Student Result Checker</h1>
            <p className="text-gray-600">Enter your details to view results</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID / School Number
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-md px-3 py-2"
                placeholder="e.g., STU001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                className="w-full border rounded-md px-3 py-2"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Check Result
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-500 text-center">
            Demo: STU001 / 2010-05-15
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals and averages
  const totalScore = filteredResults?.subjects.reduce((sum: number, sub: any) => sum + sub.total, 0) || 0;
  const averageScore = filteredResults?.subjects.length > 0 
    ? (totalScore / filteredResults.subjects.length).toFixed(1) 
    : 0;
  
  const position = filteredResults 
    ? calculatePosition(studentData.id, results) 
    : { position: 0, totalStudents: 0, positionWord: '' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white print:bg-white print:text-black">
        <div className="max-w-4xl mx-auto px-4 py-4 print:py-2">
          <div className="flex justify-between items-center print:hidden">
            <div>
              <h1 className="text-2xl font-bold">Student Portal</h1>
              <p className="text-blue-100">Welcome, {studentData.name}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                <Download className="h-4 w-4" /> Print
              </button>
              <button 
                onClick={() => {
                  setIsLoggedIn(false);
                  setStudentId('');
                  setDateOfBirth('');
                }}
                className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-2">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:border print:mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">ACADEMIC REPORT SHEET</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Student Name:</p>
                  <p className="font-semibold">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID:</p>
                  <p className="font-semibold">{studentData.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class:</p>
                  <p className="font-semibold">{filteredResults?.className || 'JSS 1'} {filteredResults?.arm || 'A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Term/Session:</p>
                  <p className="font-semibold capitalize">{selectedTerm} Term {selectedSession}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth:</p>
                  <p className="font-semibold">{studentData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Printed:</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-500 mb-1">Position</p>
                <p className="text-2xl font-bold text-blue-600">
                  {position.positionWord}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Out of {position.totalStudents} students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Result Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Select Result to View</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select 
                className="w-full border rounded-md px-3 py-2"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select 
                className="w-full border rounded-md px-3 py-2"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Term</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {filteredResults ? (
          <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border">
            {/* Subjects Table */}
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Subject</th>
                  <th className="border p-3">CA 1 (20)</th>
                  <th className="border p-3">CA 2 (20)</th>
                  <th className="border p-3">Exam (60)</th>
                  <th className="border p-3">Total</th>
                  <th className="border p-3">Grade</th>
                  <th className="border p-3">Remark</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.subjects.map((subject: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-3 font-medium">{subject.name}</td>
                    <td className="border p-3 text-center">{subject.ca1}</td>
                    <td className="border p-3 text-center">{subject.ca2}</td>
                    <td className="border p-3 text-center">{subject.exam}</td>
                    <td className="border p-3 text-center font-bold">{subject.total}</td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${subject.grade === 'A' ? 'bg-green-100 text-green-800' : ''}
                        ${subject.grade === 'B' ? 'bg-blue-100 text-blue-800' : ''}
                        ${subject.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${subject.grade === 'D' ? 'bg-orange-100 text-orange-800' : ''}
                        ${subject.grade === 'F' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="border p-3 text-center">{subject.remark}</td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={4} className="border p-3 text-right">Total</td>
                  <td className="border p-3 text-center">{totalScore}</td>
                  <td className="border p-3 text-center" colSpan={2}></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="border p-3 text-right">Average</td>
                  <td className="border p-3 text-center">{averageScore}%</td>
                  <td className="border p-3 text-center" colSpan={2}></td>
                </tr>
              </tbody>
            </table>

            {/* Grade Scale */}
            <div className="grid grid-cols-5 gap-2 mb-6 text-xs text-center">
              <div className="bg-green-100 p-2 rounded">A: 75-100</div>
              <div className="bg-blue-100 p-2 rounded">B: 65-74</div>
              <div className="bg-yellow-100 p-2 rounded">C: 55-64</div>
              <div className="bg-orange-100 p-2 rounded">D: 45-54</div>
              <div className="bg-red-100 p-2 rounded">F: 0-44</div>
            </div>

            {/* Teacher's Remarks */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <p className="text-sm text-gray-500">Class Teacher's Remark:</p>
                <p className="font-medium p-2 bg-gray-50 rounded">
                  {getClassTeacherRemark(totalScore, Number(averageScore), position.position)}
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">______________________</p>
                  <p className="text-sm text-gray-500">Class Teacher's Signature</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Principal's Remark:</p>
                <p className="font-medium p-2 bg-gray-50 rounded">
                  {getPrincipalRemark(totalScore, Number(averageScore), position.position)}
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">______________________</p>
                  <p className="text-sm text-gray-500">Principal's Signature</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Recommendation:</p>
                <p className="font-medium p-2 bg-gray-50 rounded">
                  {getRecommendation(Number(averageScore), position.position)}
                </p>
              </div>
            </div>

            {/* School Stamp and Date */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                <p>Next Term Begins: 15th September, 2024</p>
                <p>School Fee Deadline: 10th September, 2024</p>
              </div>
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 w-24 h-24 mx-auto flex items-center justify-center text-gray-400">
                  SCHOOL STAMP
                </div>
              </div>
            </div>

            {/* Print-Optimized Footer */}
            <div className="text-center text-xs text-gray-400 mt-4 print:block hidden">
              This is a computer-generated document. No signature required.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No result found for {selectedTerm} term {selectedSession}</p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #000 !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}