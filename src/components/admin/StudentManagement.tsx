'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
  classId: string;
  className: string;
  arm: string;
}

interface Class {
  id: string;
  name: string;
  arms: string[];
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    dateOfBirth: '',
    classId: '',
    arm: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        email: editingStudent.email,
        studentId: editingStudent.studentId,
        dateOfBirth: editingStudent.dateOfBirth,
        classId: editingStudent.classId,
        arm: editingStudent.arm,
      });
    } else {
      resetForm();
    }
  }, [editingStudent]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedArm) params.append('arm', selectedArm);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/students?${params}`);
      
      // Handle 401 Unauthorized
      if (res.status === 401) {
        console.log('Session expired or unauthorized');
        setStudents([]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error('Students data is not an array:', data);
        setStudents([]);
        // Only show error toast for actual errors, not empty responses
        if (data && Object.keys(data).length > 0) {
          toast.error('Invalid data format received');
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      
      // Handle 401 Unauthorized
      if (res.status === 401) {
        console.log('Session expired or unauthorized');
        setClasses([]);
        return;
      }
      
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        console.error('Classes data is not an array:', data);
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
      setClasses([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      studentId: '',
      dateOfBirth: '',
      classId: '',
      arm: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudent ? { ...formData, id: editingStudent.id } : formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save student');
      }

      toast.success(editingStudent ? 'Student updated successfully' : 'Student created successfully');
      
      if (!editingStudent) {
        toast.success(`Default password: ${data.defaultPassword}`);
      }

      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Safely filter students array
  const filteredStudents = Array.isArray(students) 
    ? students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClass || student.classId === selectedClass;
        const matchesArm = !selectedArm || student.arm === selectedArm;
        return matchesSearch && matchesClass && matchesArm;
      })
    : [];

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get available arms for the selected class
  const availableArms = formData.classId 
    ? classes.find(c => c.id === formData.classId)?.arms || []
    : [];

  // Reset arm when class changes
  useEffect(() => {
    if (formData.classId) {
      setFormData(prev => ({ ...prev, arm: '' }));
    }
  }, [formData.classId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
        <button
          onClick={() => {
            setEditingStudent(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New Student
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedArm('');
              setCurrentPage(1);
            }}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={selectedArm}
            onChange={(e) => {
              setSelectedArm(e.target.value);
              setCurrentPage(1);
            }}
            disabled={!selectedClass}
          >
            <option value="">
              {selectedClass ? 'All Arms' : 'Select a class first'}
            </option>
            {selectedClass && classes
              .find(c => c.id === selectedClass)
              ?.arms.map(arm => (
                <option key={arm} value={arm}>
                  Arm {arm}
                </option>
              ))}
          </select>

          <button
            onClick={fetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Student ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Arm</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date of Birth</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedClass || selectedArm 
                      ? 'No students match your filters' 
                      : 'No students found. Click "Add New Student" to create one.'}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{student.studentId}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4">{student.className}</td>
                    <td className="px-6 py-4">{student.arm}</td>
                    <td className="px-6 py-4">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    />
                    {!editingStudent && (
                      <p className="text-xs text-gray-500 mt-1">
                        Default password will be: {formData.studentId.toLowerCase()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value, arm: '' })}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arm *
                    </label>
                    <select
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.arm}
                      onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                      disabled={!formData.classId}
                    >
                      <option value="">
                        {formData.classId ? 'Select Arm' : 'Select a class first'}
                      </option>
                      {availableArms.map(arm => (
                        <option key={arm} value={arm}>
                          Arm {arm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}