'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Search, Calendar, BookOpen, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  studentId: string;
  dateOfBirth: string;
  classId: string;
  className: string;
  arm: string;
}

interface Subject {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  arm: string;
  term: string;
  session: string;
  subjects: Subject[];
  totalScore: number;
  averageScore: number;
  position: number | null;
  totalStudents: number | null;
  status: string;
  classTeacherRemark?: string;
  principalRemark?: string;
  recommendation?: string;
}

export default function StudentPortal() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [fetchingResults, setFetchingResults] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to authenticate student
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, dateOfBirth }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setStudentData(data.student);
      
      // Fetch student's results
      await fetchStudentResults(data.student.id);
      
      setIsLoggedIn(true);
      toast.success(`Welcome, ${data.student.name}!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async (studentId: string) => {
    setFetchingResults(true);
    try {
      const res = await fetch(`/api/student/results?studentId=${studentId}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Filter only approved results
        const approvedResults = data.filter((r: Result) => r.status === 'APPROVED');
        setResults(approvedResults);
        
        // Set default selections if there are results
        if (approvedResults.length > 0) {
          setSelectedSession(approvedResults[0].session);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setFetchingResults(false);
    }
  };

  const getFilteredResult = () => {
    if (!selectedSession || !selectedTerm) return null;
    return results.find(
      r => r.session === selectedSession && r.term === selectedTerm
    );
  };

  const filteredResult = getFilteredResult();

  // Get unique sessions from results
  const sessions = [...new Set(results.map(r => r.session))].sort().reverse();
  const terms = ['first', 'second', 'third'];

  const getPositionInWords = (position: number) => {
    if (position === 1) return '1st Position';
    if (position === 2) return '2nd Position';
    if (position === 3) return '3rd Position';
    return `${position}th Position`;
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">A</span>;
      case 'B': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">B</span>;
      case 'C': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">C</span>;
      case 'D': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">D</span>;
      case 'F': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">F</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{grade}</span>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Result'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-2">Demo Students:</p>
            <p>• Chidi Obi: STU001 / 2010-05-15</p>
            <p>• Amina Suleiman: STU002 / 2011-08-22</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Portal</h1>
              <p className="text-blue-100 mt-1">Welcome, {studentData?.name}</p>
            </div>
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setStudentId('');
                setDateOfBirth('');
                setResults([]);
              }}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Student Name</p>
              <p className="font-semibold">{studentData?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="font-semibold">{studentData?.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-semibold">{studentData?.className} {studentData?.arm}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-semibold">{new Date(studentData?.dateOfBirth || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              No approved results are available for you at this time.
            </p>
          </div>
        ) : (
          <>
            {/* Result Selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Select Result to View</h2>
              </div>
              
              {fetchingResults ? (
                <p className="text-gray-500">Loading results...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Session
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                    >
                      <option value="">Select Session</option>
                      {sessions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                      <option value="first">First Term</option>
                      <option value="second">Second Term</option>
                      <option value="third">Third Term</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Result Display */}
            {filteredResult ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">ACADEMIC REPORT SHEET</h2>
                  <p className="text-gray-600">
                    {filteredResult.className} {filteredResult.arm} - {filteredResult.term.toUpperCase()} TERM {filteredResult.session}
                  </p>
                </div>

                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium">{filteredResult.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">{studentData?.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium">{filteredResult.className} {filteredResult.arm}</p>
                    </div>
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
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
                      {filteredResult.subjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="border p-3 font-medium">{subject.name}</td>
                          <td className="border p-3 text-center">{subject.ca1}</td>
                          <td className="border p-3 text-center">{subject.ca2}</td>
                          <td className="border p-3 text-center">{subject.exam}</td>
                          <td className="border p-3 text-center font-bold">{subject.total}</td>
                          <td className="border p-3 text-center">{getGradeBadge(subject.grade)}</td>
                          <td className="border p-3 text-center">{subject.remark || '-'}</td>
                        </tr>
                      ))}
                      
                      {/* Summary Row */}
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={4} className="border p-3 text-right">Total</td>
                        <td className="border p-3 text-center">{filteredResult.totalScore}</td>
                        <td className="border p-3 text-center" colSpan={2}></td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="border p-3 text-right">Average</td>
                        <td className="border p-3 text-center">{filteredResult.averageScore.toFixed(1)}%</td>
                        <td className="border p-3 text-center" colSpan={2}></td>
                      </tr>
                      {filteredResult.position && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="border p-3 text-right">Position</td>
                          <td className="border p-3 text-center font-bold text-blue-600">
                            {getPositionInWords(filteredResult.position)}
                          </td>
                          <td className="border p-3 text-center" colSpan={2}></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Grade Scale */}
                <div className="grid grid-cols-5 gap-2 mb-6 text-xs text-center">
                  <div className="bg-green-100 p-2 rounded">A: 75-100</div>
                  <div className="bg-blue-100 p-2 rounded">B: 65-74</div>
                  <div className="bg-yellow-100 p-2 rounded">C: 55-64</div>
                  <div className="bg-orange-100 p-2 rounded">D: 45-54</div>
                  <div className="bg-red-100 p-2 rounded">F: 0-44</div>
                </div>

                {/* Remarks */}
                {(filteredResult.classTeacherRemark || filteredResult.principalRemark || filteredResult.recommendation) && (
                  <div className="space-y-4 border-t pt-4">
                    {filteredResult.classTeacherRemark && (
                      <div>
                        <p className="text-sm text-gray-500">Class Teacher's Remark:</p>
                        <p className="font-medium p-2 bg-gray-50 rounded">{filteredResult.classTeacherRemark}</p>
                      </div>
                    )}
                    {filteredResult.principalRemark && (
                      <div>
                        <p className="text-sm text-gray-500">Principal's Remark:</p>
                        <p className="font-medium p-2 bg-gray-50 rounded">{filteredResult.principalRemark}</p>
                      </div>
                    )}
                    {filteredResult.recommendation && (
                      <div>
                        <p className="text-sm text-gray-500">Recommendation:</p>
                        <p className="font-medium p-2 bg-gray-50 rounded">{filteredResult.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Print Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Print Result
                  </button>
                </div>
              </div>
            ) : selectedSession && selectedTerm ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No result found for {selectedTerm} term {selectedSession}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}