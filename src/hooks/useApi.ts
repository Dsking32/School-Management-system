import { useState } from 'react';
import toast from 'react-hot-toast';

export function useApi() {
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (classId?: string, arm?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.append('classId', classId);
      if (arm) params.append('arm', arm);
      
      const res = await fetch(`/api/students?${params}`);
      return await res.json();
    } catch (error) {
      toast.error('Failed to fetch students');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Result submitted successfully');
      return await res.json();
    } catch (error) {
      toast.error('Failed to submit result');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getResults = async (studentId?: string) => {
    const res = await fetch(`/api/results${studentId ? `?studentId=${studentId}` : ''}`);
    return await res.json();
  };

  return { loading, fetchStudents, submitResult, getResults };
}