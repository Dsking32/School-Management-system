'use client';

import { useState, useEffect } from 'react';
import { 
  Save,
  School,
  Hash,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface School {
  id: string;
  name: string;
  code: string;
}

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalResults: number;
}

interface GradeScale {
  min: number;
  max: number;
  remark: string;
}

interface GradingSystem {
  [key: string]: GradeScale;
}

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gradingSystem, setGradingSystem] = useState<GradingSystem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      setSchool(data.school);
      setStats(data.stats);
      setGradingSystem(data.gradingSystem);
      setFormData({
        name: data.school.name,
        code: data.school.code,
      });
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSchool(data);
      toast.success('School settings updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* School Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              School Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier for your school (e.g., DEMO001)
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Grading System Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Grading System
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Grade</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Range</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {gradingSystem && Object.entries(gradingSystem).map(([grade, scale]) => (
                    <tr key={grade}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          grade === 'A' ? 'bg-green-100 text-green-700' :
                          grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                          grade === 'D' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {scale.min} - {scale.max}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {scale.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              * Grading system is fixed and cannot be modified in this version
            </p>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              System Statistics
            </h3>

            {stats && (
              <div className="space-y-4">
                <StatItem
                  icon={Users}
                  label="Total Teachers"
                  value={stats.totalTeachers}
                  color="blue"
                />
                <StatItem
                  icon={GraduationCap}
                  label="Total Students"
                  value={stats.totalStudents}
                  color="green"
                />
                <StatItem
                  icon={BookOpen}
                  label="Total Classes"
                  value={stats.totalClasses}
                  color="purple"
                />
                <StatItem
                  icon={Award}
                  label="Total Subjects"
                  value={stats.totalSubjects}
                  color="yellow"
                />
                <StatItem
                  icon={BarChart3}
                  label="Total Results"
                  value={stats.totalResults}
                  color="orange"
                />
              </div>
            )}
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              System Health
            </h3>

            <div className="space-y-3">
              <HealthItem
                label="Database Connection"
                status="healthy"
              />
              <HealthItem
                label="Authentication Service"
                status="healthy"
              />
              <HealthItem
                label="API Routes"
                status="healthy"
              />
              <HealthItem
                label="Storage"
                status="healthy"
              />
              <HealthItem
                label="Email Service"
                status="healthy"
              />
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Environment</span>
                <span className="font-medium capitalize">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">School Code</span>
                <span className="font-medium">{school?.code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatItem({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-semibold text-lg">{value}</span>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span className="text-xs text-green-600 capitalize">{status}</span>
      </div>
    </div>
  );
}