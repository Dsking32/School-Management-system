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
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Term {
  id: string;
  name: string;
  isActive: boolean;
  sessionId: string;
}

interface Session {
  id: string;
  name: string;
  isActive: boolean;
  terms: Term[];
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (editingSession) {
      setFormData({
        name: editingSession.name,
      });
    } else {
      setFormData({ name: '' });
    }
  }, [editingSession]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/sessions';
      const method = editingSession ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSession ? { ...formData, id: editingSession.id } : formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save session');
      }

      toast.success(editingSession ? 'Session updated successfully' : 'Session created successfully');

      setShowModal(false);
      setEditingSession(null);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session? This will also delete all terms in this session.')) return;

    try {
      const res = await fetch(`/api/admin/sessions?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete session');
      }

      toast.success('Session deleted successfully');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSetActiveSession = async (session: Session) => {
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          name: session.name,
          isActive: true
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set active session');
      }

      toast.success(`${session.name} set as active session`);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSetActiveTerm = async (term: Term) => {
    try {
      const res = await fetch('/api/admin/terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: term.id,
          isActive: true
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to set active term');
      }

      toast.success(`${term.name} set as active term`);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Academic Sessions</h2>
        <button
          onClick={() => {
            setEditingSession(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No sessions found. Click "Add New Session" to create one.
          </div>
        ) : (
          <div className="divide-y">
            {paginatedSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{session.name}</h3>
                    {session.isActive ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active Session
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetActiveSession(session)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Set as Active
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSession(session);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Session"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {session.terms.map((term) => (
                    <div
                      key={term.id}
                      className={`border rounded-lg p-4 ${
                        term.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{term.name}</span>
                        {term.isActive ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetActiveTerm(term)}
                            disabled={!session.isActive}
                            className={`text-xs underline ${
                              session.isActive 
                                ? 'text-blue-600 hover:text-blue-800' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={!session.isActive ? 'Activate session first' : ''}
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                      {!session.isActive && !term.isActive && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Activate session first
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
                  {editingSession ? 'Edit Session' : 'Add New Session'}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2024/2025"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Three terms (First, Second, Third) will be created automatically
                  </p>
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
                    {editingSession ? 'Update Session' : 'Add Session'}
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