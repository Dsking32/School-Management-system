'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If there's an active session, show warning
  useEffect(() => {
    if (session) {
      toast.success(`Already logged in as ${session.user?.name}`, {
        duration: 4000,
        icon: '👋'
      });
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, sign out any existing session
      if (session) {
        await signOut({ redirect: false });
        // Small delay to ensure sign out completes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Then sign in with new credentials
      const result = await signIn('credentials', {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        toast.error('Invalid credentials');
        setLoading(false);
      } else {
        toast.success(`Welcome, ${email}!`);
        
        // Force a hard navigation to ensure fresh session
        if (role === 'admin') {
          window.location.href = '/admin';
        } else if (role === 'teacher') {
          window.location.href = '/teacher';
        } else {
          window.location.href = '/student';
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      toast.error('Login failed');
      setLoading(false);
    }
  };

  const handleLogoutFirst = async () => {
    await signOut({ redirect: false });
    toast.success('Logged out successfully');
    // Clear any stored session data
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">School Management System</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {session && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Already logged in as <strong>{session.user?.name}</strong>
            </p>
            <button
              onClick={handleLogoutFirst}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Click here to logout first
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <select 
              className="w-full border rounded-md px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium mb-2">Demo Login:</p>
          <p>Student: student@school.com / password</p>
          <p>Teacher: john.okonkwo@school.com / password</p>
          <p>Admin: admin@school.com / admin123</p>
          <p className="text-xs text-gray-400 mt-2">
            Note: Please use different browsers or incognito windows to test multiple accounts simultaneously
          </p>
        </div>
      </div>
    </div>
  );
}