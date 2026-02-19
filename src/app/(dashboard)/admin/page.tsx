'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen,
  LogOut,
  Eye,
  Settings,
  Calendar,
  BookMarked,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import all admin components
import ClassManagement from '@/components/admin/ClassManagement';
import StudentManagement from '@/components/admin/StudentManagement';
import TeacherManagement from '@/components/admin/TeacherManagement';
import SubjectManagement from '@/components/admin/SubjectManagement';
import SessionManagement from '@/components/admin/SessionManagement';
import ResultManagement from '@/components/admin/ResultManagement';
import SystemSettings from '@/components/admin/SystemSettings';



interface DashboardStats {
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  pendingResults: number;
  approvedResults: number;
  totalSubjects: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingResults: 0,
    approvedResults: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Class Management', icon: BookOpen },
    { id: 'students', label: 'Student Management', icon: GraduationCap },
    { id: 'teachers', label: 'Teacher Management', icon: Users },
    { id: 'subjects', label: 'Subject Management', icon: BookMarked },
    { id: 'results', label: 'Result Management', icon: Eye },
    { id: 'sessions', label: 'Academic Sessions', icon: Calendar },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">School Management</p>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                  activeMenu === item.id 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Dashboard Overview */}
        {activeMenu === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            
            {loading ? (
              <div className="text-center py-12">Loading stats...</div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <StatCard
                    title="Classes"
                    value={stats.totalClasses}
                    icon={BookOpen}
                    color="purple"
                  />
                  <StatCard
                    title="Teachers"
                    value={stats.totalTeachers}
                    icon={Users}
                    color="blue"
                  />
                  <StatCard
                    title="Students"
                    value={stats.totalStudents}
                    icon={GraduationCap}
                    color="green"
                  />
                  <StatCard
                    title="Subjects"
                    value={stats.totalSubjects}
                    icon={BookMarked}
                    color="yellow"
                  />
                  <StatCard
                    title="Pending Results"
                    value={stats.pendingResults}
                    icon={Eye}
                    color="orange"
                  />
                  <StatCard
                    title="Approved Results"
                    value={stats.approvedResults}
                    icon={BarChart3}
                    color="teal"
                  />
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton
                      label="Add Class"
                      onClick={() => setActiveMenu('classes')}
                      icon={BookOpen}
                      color="purple"
                    />
                    <QuickActionButton
                      label="Add Student"
                      onClick={() => setActiveMenu('students')}
                      icon={GraduationCap}
                      color="green"
                    />
                    <QuickActionButton
                      label="Add Teacher"
                      onClick={() => setActiveMenu('teachers')}
                      icon={Users}
                      color="blue"
                    />
                    <QuickActionButton
                      label="Review Results"
                      onClick={() => setActiveMenu('results')}
                      icon={Eye}
                      color="orange"
                    />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-3">
                    <StatusItem
                      label="Database Connection"
                      status="healthy"
                    />
                    <StatusItem
                      label="Authentication Service"
                      status="healthy"
                    />
                    <StatusItem
                      label="API Routes"
                      status="healthy"
                    />
                    <StatusItem
                      label="Storage"
                      status="healthy"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Class Management */}
        {activeMenu === 'classes' && <ClassManagement />}

        {/* Student Management */}
        {activeMenu === 'students' && <StudentManagement />}

        {/* Teacher Management */}
        {activeMenu === 'teachers' && <TeacherManagement />}

        {/* Subject Management - Now using the actual component */}
        {activeMenu === 'subjects' && <SubjectManagement />}

        {/* Result Management */}
	{activeMenu === 'results' && <ResultManagement />}

        {/* Academic Sessions */}
	{activeMenu === 'sessions' && <SessionManagement />}

        {/* System Settings */}
	{activeMenu === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, icon: Icon, color }: any) {
  const colors: any = {
    purple: 'text-purple-600 hover:bg-purple-50 border-purple-200',
    green: 'text-green-600 hover:bg-green-50 border-green-200',
    blue: 'text-blue-600 hover:bg-blue-50 border-blue-200',
    orange: 'text-orange-600 hover:bg-orange-50 border-orange-200',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 border rounded-lg hover:bg-gray-50 transition text-center ${colors[color]}`}
    >
      <Icon className="h-6 w-6 mx-auto mb-2" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="flex items-center gap-1 text-green-600">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span className="text-sm capitalize">{status}</span>
      </span>
    </div>
  );
}