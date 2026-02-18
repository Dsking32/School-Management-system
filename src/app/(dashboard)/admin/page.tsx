'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { mockTeachers, mockStudents, mockClasses, mockResults } from '@/lib/mockData';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');

  // Stats for dashboard
  const stats = {
    totalClasses: mockClasses.length,
    totalTeachers: mockTeachers.length,
    totalStudents: mockStudents.length,
    pendingResults: mockResults.length,
  };

  // Filter results based on class and arm
  const filteredResults = mockResults.filter(result => {
    const matchesClass = !selectedClass || result.className === selectedClass;
    const matchesArm = !selectedArm || result.arm === selectedArm;
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesArm && matchesSearch;
  });

  const handleApproveResult = (resultId: string) => {
    toast.success('Result approved successfully');
  };

  const handleRejectResult = (resultId: string) => {
    toast.success('Result rejected');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-purple-700">Admin Panel</h1>
        </div>
        
        <nav className="mt-4">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeMenu === 'dashboard' ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveMenu('classes')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeMenu === 'classes' ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            Manage Classes
          </button>

          <button
            onClick={() => setActiveMenu('teachers')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeMenu === 'teachers' ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5" />
            Manage Teachers
          </button>

          <button
            onClick={() => setActiveMenu('students')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeMenu === 'students' ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            Manage Students
          </button>

          <button
            onClick={() => setActiveMenu('results')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeMenu === 'results' ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="h-5 w-5" />
            View / Approve Results
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Classes</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalClasses}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Teachers</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalTeachers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Students</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Results Submitted</p>
                    <p className="text-3xl font-bold mt-1">{stats.pendingResults}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Eye className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveMenu('classes')} className="p-4 border rounded-lg hover:bg-gray-50">
                  <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm">Manage Classes</span>
                </button>
                <button onClick={() => setActiveMenu('teachers')} className="p-4 border rounded-lg hover:bg-gray-50">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm">Manage Teachers</span>
                </button>
                <button onClick={() => setActiveMenu('students')} className="p-4 border rounded-lg hover:bg-gray-50">
                  <GraduationCap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm">Manage Students</span>
                </button>
                <button onClick={() => setActiveMenu('results')} className="p-4 border rounded-lg hover:bg-gray-50">
                  <Eye className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <span className="text-sm">View Results</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE CLASSES */}
        {activeMenu === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Classes</h2>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add New Class
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Arms</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Students</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class Teacher</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockClasses.map(cls => (
                    <tr key={cls.id}>
                      <td className="px-6 py-4 font-medium">{cls.name}</td>
                      <td className="px-6 py-4">{cls.arms.join(', ')}</td>
                      <td className="px-6 py-4">{mockStudents.filter(s => s.classId === cls.id).length}</td>
                      <td className="px-6 py-4">Mr. John Doe</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MANAGE TEACHERS */}
        {activeMenu === 'teachers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Teachers</h2>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add New Teacher
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Teacher ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Assigned Classes</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockTeachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 font-medium">{teacher.teacherId}</td>
                      <td className="px-6 py-4">{teacher.name}</td>
                      <td className="px-6 py-4">{teacher.email}</td>
                      <td className="px-6 py-4">{teacher.classIds.join(', ')}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MANAGE STUDENTS */}
        {activeMenu === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Students</h2>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add New Student
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Student ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Arm</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date of Birth</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 font-medium">{student.studentId}</td>
                      <td className="px-6 py-4">{student.name}</td>
                      <td className="px-6 py-4">JSS {student.classId}</td>
                      <td className="px-6 py-4">{student.arm}</td>
                      <td className="px-6 py-4">{student.dateOfBirth}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW / FILTER / APPROVE RESULTS */}
        {activeMenu === 'results' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">View & Approve Results</h2>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {mockClasses.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Arm</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedArm}
                    onChange={(e) => setSelectedArm(e.target.value)}
                  >
                    <option value="">All Arms</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Arm</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Term</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Session</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Subjects</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResults.map(result => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 font-medium">{result.studentName}</td>
                      <td className="px-6 py-4">{result.className}</td>
                      <td className="px-6 py-4">{result.arm}</td>
                      <td className="px-6 py-4 capitalize">{result.term}</td>
                      <td className="px-6 py-4">{result.session}</td>
                      <td className="px-6 py-4">{result.subjects.length} subjects</td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          Pending Approval
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleApproveResult(result.id)}
                          className="text-green-600 hover:text-green-800 mr-3"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleRejectResult(result.id)}
                          className="text-red-600 hover:text-red-800 mr-3"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}