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
  BookOpen,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  classArms: string[];
  teacherId: string | null;
  teacherName: string;
}

interface Class {
  id: string;
  name: string;
  arms: string[];
}

interface Teacher {
  id: string;
  name: string;
  teacherId: string;
  classIds: string[];
}

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    classId: '',
    teacherId: '',
  });

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name,
        code: editingSubject.code,
        classId: editingSubject.classId,
        teacherId: editingSubject.teacherId || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        classId: '',
        teacherId: '',
      });
    }
  }, [editingSubject]);

  const fetchSubjects = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);

      const res = await fetch(`/api/admin/subjects?${params}`);
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/subjects';
      const method = editingSubject ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubject ? { ...formData, id: editingSubject.id } : formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save subject');
      }

      toast.success(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');

      setShowModal(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete subject');
      }

      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || subject.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get available teachers for selected class
  const availableTeachers = formData.classId
    ? teachers.filter(t => t.classIds.includes(formData.classId))
    : teachers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
        <button
          onClick={() => {
            setEditingSubject(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New Subject
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or code..."
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
              setCurrentPage(1);
            }}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={fetchSubjects}
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Subject Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Teacher</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading subjects...
                  </td>
                </tr>
              ) : paginatedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No subjects found. Click "Add New Subject" to create one.
                  </td>
                </tr>
              ) : (
                paginatedSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{subject.code}</td>
                    <td className="px-6 py-4">{subject.name}</td>
                    <td className="px-6 py-4">{subject.className}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subject.teacherName !== 'Not Assigned' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {subject.teacherName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingSubject(subject);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="Edit Subject"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Subject"
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
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mathematics"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., MATH101"
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    required
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value, teacherId: '' })}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Teacher (Optional)
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    disabled={!formData.classId}
                  >
                    <option value="">Not Assigned</option>
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.teacherId})
                      </option>
                    ))}
                  </select>
                  {formData.classId && availableTeachers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No teachers available for this class. Add teachers first.
                    </p>
                  )}
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
                    {editingSubject ? 'Update Subject' : 'Add Subject'}
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