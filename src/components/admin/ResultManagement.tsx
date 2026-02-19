'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Calendar,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  arm: string;
  term: string;
  session: string;
  subjects: any[];
  totalScore: number;
  averageScore: number;
  position: number | null;
  totalStudents: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  classTeacherRemark?: string;
  principalRemark?: string;
  recommendation?: string;
}

interface Class {
  id: string;
  name: string;
  arms: string[];
}

interface FilterOptions {
  classId: string;
  arm: string;
  session: string;
  term: string;
  status: string;
  search: string;
}

export default function ResultManagement() {
  const [results, setResults] = useState<Result[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<FilterOptions>({
    classId: '',
    arm: '',
    session: '',
    term: '',
    status: '',
    search: '',
  });

  const [remarkData, setRemarkData] = useState({
    classTeacherRemark: '',
    principalRemark: '',
    recommendation: '',
  });

  // Get unique sessions and terms from results
  const [sessions, setSessions] = useState<string[]>([]);
  const terms = ['first', 'second', 'third'];

  useEffect(() => {
    fetchClasses();
    fetchResults();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filters.classId, filters.arm, filters.session, filters.term, filters.status]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.arm) params.append('arm', filters.arm);
      if (filters.session) params.append('session', filters.session);
      if (filters.term) params.append('term', filters.term);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/results?${params}`);
      const data = await res.json();
      setResults(data);
      
      // Extract unique sessions
      const uniqueSessions = [...new Set(data.map((r: Result) => r.session))] as string[];
      setSessions(uniqueSessions.sort().reverse());
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResults();
  };

  const handleApprove = async (resultId: string) => {
    try {
      const res = await fetch('/api/admin/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId,
          status: 'APPROVED',
          ...remarkData
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve result');
      }

      toast.success('Result approved successfully');
      fetchResults();
      setShowApproveModal(false);
      setRemarkData({
        classTeacherRemark: '',
        principalRemark: '',
        recommendation: '',
      });
      setSelectedResult(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (resultId: string) => {
    if (!confirm('Are you sure you want to reject this result?')) return;

    try {
      const res = await fetch('/api/admin/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId,
          status: 'REJECTED',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject result');
      }

      toast.success('Result rejected successfully');
      fetchResults();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleViewDetails = async (resultId: string) => {
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });

      const data = await res.json();
      setSelectedResult(data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to fetch result details');
    }
  };

  const clearFilters = () => {
    setFilters({
      classId: '',
      arm: '',
      session: '',
      term: '',
      status: '',
      search: '',
    });
    setCurrentPage(1);
    setTimeout(() => fetchResults(), 100);
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'APPROVED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return null;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Result Management</h2>
        <div className="text-sm text-gray-500">
          Total: {results.length} results
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filter Results</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value, arm: '' })}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arm</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.arm}
              onChange={(e) => setFilters({ ...filters, arm: e.target.value })}
              disabled={!filters.classId}
            >
              <option value="">All Arms</option>
              {filters.classId && classes
                .find(c => c.id === filters.classId)
                ?.arms.map(arm => (
                  <option key={arm} value={arm}>Arm {arm}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.session}
              onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            >
              <option value="">All Sessions</option>
              {sessions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            >
              <option value="">All Terms</option>
              {terms.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Term</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Arm</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Session/Term</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Average</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Loading results...
                  </td>
                </tr>
              ) : paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No results found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{result.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{result.studentNumber}</td>
                    <td className="px-6 py-4">{result.className}</td>
                    <td className="px-6 py-4">{result.arm}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{result.session}</div>
                        <div className="text-xs text-gray-500 capitalize">{result.term} term</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{result.totalScore}</td>
                    <td className="px-6 py-4">{result.averageScore.toFixed(1)}%</td>
                    <td className="px-6 py-4">{getStatusBadge(result.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(result.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {result.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedResult(result);
                              setShowApproveModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 mr-2"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(result.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-gray-600 disabled:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-gray-600 disabled:text-gray-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Result Details Modal */}
      {showDetailsModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Result Details</h3>
                <button onClick={() => setShowDetailsModal(false)}>
                  <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium">{selectedResult.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">{selectedResult.studentNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium">{selectedResult.className} {selectedResult.arm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Session/Term</p>
                      <p className="font-medium">{selectedResult.session} - {selectedResult.term} term</p>
                    </div>
                  </div>
                </div>

                {/* Score Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Total Score</p>
                      <p className="text-2xl font-bold text-green-600">{selectedResult.totalScore}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedResult.averageScore.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedResult.position || '-'}<span className="text-sm text-gray-500">/{selectedResult.totalStudents}</span>
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="mt-1">{getStatusBadge(selectedResult.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <h4 className="font-semibold p-4 border-b bg-gray-50">Subject Scores</h4>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Subject</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">CA 1 (20)</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">CA 2 (20)</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Exam (60)</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Total</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedResult.subjects.map((subject: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 font-medium">{subject.name}</td>
                          <td className="px-4 py-2 text-center">{subject.ca1}</td>
                          <td className="px-4 py-2 text-center">{subject.ca2}</td>
                          <td className="px-4 py-2 text-center">{subject.exam}</td>
                          <td className="px-4 py-2 text-center font-bold">{subject.total}</td>
                          <td className="px-4 py-2 text-center">{getGradeBadge(subject.grade)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Remarks */}
                {(selectedResult.classTeacherRemark || selectedResult.principalRemark || selectedResult.recommendation) && (
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3">Remarks</h4>
                    <div className="space-y-3">
                      {selectedResult.classTeacherRemark && (
                        <div>
                          <p className="text-sm text-gray-500">Class Teacher:</p>
                          <p className="bg-white p-2 rounded border border-yellow-200">{selectedResult.classTeacherRemark}</p>
                        </div>
                      )}
                      {selectedResult.principalRemark && (
                        <div>
                          <p className="text-sm text-gray-500">Principal:</p>
                          <p className="bg-white p-2 rounded border border-yellow-200">{selectedResult.principalRemark}</p>
                        </div>
                      )}
                      {selectedResult.recommendation && (
                        <div>
                          <p className="text-sm text-gray-500">Recommendation:</p>
                          <p className="bg-white p-2 rounded border border-yellow-200 font-medium">{selectedResult.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Class Performance */}
                {selectedResult.allResults && selectedResult.allResults.length > 0 && (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <h4 className="font-semibold p-4 border-b bg-gray-50 flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Class Performance ({selectedResult.className} {selectedResult.arm})
                    </h4>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Position</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Student</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Total Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedResult.allResults.slice(0, 10).map((r: any) => (
                          <tr key={r.id} className={r.id === selectedResult.id ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 font-medium">{r.position}</td>
                            <td className="px-4 py-2">{r.studentName}</td>
                            <td className="px-4 py-2 text-center font-medium">{r.totalScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Approve Result</h3>
                <button onClick={() => {
                  setShowApproveModal(false);
                  setRemarkData({
                    classTeacherRemark: '',
                    principalRemark: '',
                    recommendation: '',
                  });
                }}>
                  <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  Approving result for <span className="font-medium">{selectedResult.studentName}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {selectedResult.className} {selectedResult.arm} • {selectedResult.term} term {selectedResult.session}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher's Remark
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="e.g., Excellent performance, keep it up!"
                    value={remarkData.classTeacherRemark}
                    onChange={(e) => setRemarkData({ ...remarkData, classTeacherRemark: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principal's Remark
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="e.g., Promoted to next class"
                    value={remarkData.principalRemark}
                    onChange={(e) => setRemarkData({ ...remarkData, principalRemark: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendation
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Promoted, Repeat, Scholarship recommended"
                    value={remarkData.recommendation}
                    onChange={(e) => setRemarkData({ ...remarkData, recommendation: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setRemarkData({
                      classTeacherRemark: '',
                      principalRemark: '',
                      recommendation: '',
                    });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedResult.id)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}