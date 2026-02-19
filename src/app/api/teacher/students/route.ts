import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET students by class and arm
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const arm = searchParams.get('arm');

    if (!classId || !arm) {
      return NextResponse.json({ error: 'Class ID and arm are required' }, { status: 400 });
    }

    // Verify teacher has access to this class
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!teacher || !teacher.classIds.includes(classId)) {
      return NextResponse.json({ error: 'Access denied to this class' }, { status: 403 });
    }

    // Get students
    const students = await prisma.student.findMany({
      where: {
        classId,
        arm
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    const formatted = students.map(s => ({
      id: s.id,
      name: s.user.name,
      studentId: s.studentId,
      email: s.user.email,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}