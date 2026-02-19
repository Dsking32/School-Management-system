import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug log
    console.log('Session in dashboard API:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log('No user in session');
      return NextResponse.json({ error: 'Unauthorized - No user' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log('User is not admin:', session.user.role);
      return NextResponse.json({ error: 'Unauthorized - Not admin' }, { status: 401 });
    }

    // Get real stats from database
    const [
      totalClasses,
      totalTeachers,
      totalStudents,
      pendingResults,
      approvedResults,
      totalSubjects
    ] = await Promise.all([
      prisma.class.count(),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.result.count({ where: { status: 'PENDING' } }),
      prisma.result.count({ where: { status: 'APPROVED' } }),
      prisma.subject.count(),
    ]);

    return NextResponse.json({
      totalClasses,
      totalTeachers,
      totalStudents,
      pendingResults,
      approvedResults,
      totalSubjects,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}