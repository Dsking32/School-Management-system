'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  arms: string[];
  studentCount: number;
  subjectCount: number;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    arms: ['A', 'B', 'C'] as string[],
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (editingClass) {
      setFormData({
        name: editingClass.name,
        arms: editingClass.arms,
      });
    } else {
      setFormData({
        name: '',
        arms: ['A', 'B', 'C'],
      });
    }
  }, [editingClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        console.error('Classes data is not an array:', data);
        setClasses([]);
        toast.error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/classes';
      const method = editingClass ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClass ? { ...formData, id: editingClass.id } : formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save class');
      }

      toast.success(editingClass ? 'Class updated successfully' : 'Class created successfully');
      setShowModal(false);
      setEditingClass(null);
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, studentCount: number) => {
    if (studentCount > 0) {
      toast.error('Cannot delete class with students');
      return;
    }

    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete class');
      }

      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleArmChange = (index: number, value: string) => {
    const newArms = [...formData.arms];
    newArms[index] = value;
    setFormData({ ...formData, arms: newArms });
  };

  const addArm = () => {
    setFormData({ ...formData, arms: [...formData.arms, ''] });
  };

  const removeArm = (index: number) => {
    const newArms = formData.arms.filter((_, i) => i !== index);
    setFormData({ ...formData, arms: newArms });
  };

  // Safely paginate classes
  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const paginatedClasses = classes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Class Management</h2>
        <button
          onClick={() => {
            setEditingClass(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Subjects</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Loading classes...
                </td>
              </tr>
            ) : paginatedClasses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No classes found. Click "Add New Class" to create one.
                </td>
              </tr>
            ) : (
              paginatedClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cls.name}</td>
                  <td className="px-6 py-4">{cls.arms?.join(', ') || ''}</td>
                  <td className="px-6 py-4">{cls.studentCount || 0} students</td>
                  <td className="px-6 py-4">{cls.subjectCount || 0} subjects</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.studentCount || 0)}
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., JSS 1, SS 2"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arms (A, B, C, etc.)
                  </label>
                  {formData.arms.map((arm, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder={`Arm ${String.fromCharCode(65 + index)}`}
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={arm}
                        onChange={(e) => handleArmChange(index, e.target.value)}
                      />
                      {formData.arms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArm(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addArm}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    + Add another arm
                  </button>
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
                    {editingClass ? 'Update Class' : 'Add Class'}
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