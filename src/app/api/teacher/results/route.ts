import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// POST submit result
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      studentId, 
      classId, 
      arm, 
      term, 
      session: academicSession,
      subjects,
      totalScore,
      averageScore 
    } = body;

    if (!studentId || !classId || !arm || !term || !academicSession || !subjects) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get teacher
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Check if result already exists
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId,
        term,
        session: academicSession
      }
    });

    if (existingResult) {
      return NextResponse.json({ 
        error: 'Result already exists for this student, term and session' 
      }, { status: 400 });
    }

    // Get school
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Create result
    const result = await prisma.result.create({
      data: {
        studentId,
        className: (await prisma.class.findUnique({ where: { id: classId } }))?.name || '',
        arm,
        term,
        session: academicSession,
        subjects,
        totalScore,
        averageScore,
        status: 'PENDING',
        submittedBy: session.user.id,
        schoolId: school.id,
      },
    });

    return NextResponse.json({
      id: result.id,
      status: result.status,
      message: 'Result submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting result:', error);
    return NextResponse.json({ error: 'Failed to submit result' }, { status: 500 });
  }
}

// GET teacher's submitted results
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const results = await prisma.result.findMany({
      where: {
        submittedBy: session.user.id,
        ...(status && { status })
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    const formatted = results.map(r => ({
      id: r.id,
      studentName: r.student.user.name,
      className: r.className,
      arm: r.arm,
      term: r.term,
      session: r.session,
      totalScore: r.totalScore,
      status: r.status,
      submittedAt: r.submittedAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}