import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET all results with filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const arm = searchParams.get('arm');
    const status = searchParams.get('status');
    const sessionName = searchParams.get('session');
    const term = searchParams.get('term');
    const search = searchParams.get('search');

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Build where clause
    const where: any = {
      schoolId: school.id,
    };

    if (classId) where.classId = classId;
    if (arm) where.arm = arm;
    if (status) where.status = status;
    if (sessionName) where.session = sessionName;
    if (term) where.term = term;

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            class: { select: { name: true, arms: true } }
          }
        },
      },
      orderBy: [
        { session: 'desc' },
        { term: 'asc' },
        { student: { user: { name: 'asc' } } }
      ]
    });

    // Filter by search if provided
    let filteredResults = results;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResults = results.filter(r => 
        r.student.user.name.toLowerCase().includes(searchLower) ||
        r.student.studentId.toLowerCase().includes(searchLower)
      );
    }

    const formatted = filteredResults.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.user.name,
      studentNumber: r.student.studentId,
      className: r.student.class.name,
      arm: r.arm,
      term: r.term,
      session: r.session,
      subjects: r.subjects,
      totalScore: r.totalScore,
      averageScore: r.averageScore,
      position: r.position,
      totalStudents: r.totalStudents,
      status: r.status,
      submittedAt: r.submittedAt,
      classTeacherRemark: r.classTeacherRemark,
      principalRemark: r.principalRemark,
      recommendation: r.recommendation,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

// PATCH update result status (approve/reject)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resultId, status, classTeacherRemark, principalRemark, recommendation } = body;

    if (!resultId || !status) {
      return NextResponse.json({ error: 'Result ID and status are required' }, { status: 400 });
    }

    // Get the result to calculate position if approving
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    let updateData: any = {
      status,
      classTeacherRemark,
      principalRemark,
      recommendation,
      approvedBy: session.user.id,
      approvedAt: new Date(),
    };

    // If approving, calculate position in class
    if (status === 'APPROVED') {
      // Get all results for this class, term, session with same status
      const allClassResults = await prisma.result.findMany({
        where: {
          classId: result.classId,
          term: result.term,
          session: result.session,
          status: 'APPROVED'
        },
        select: {
          id: true,
          totalScore: true
        },
        orderBy: {
          totalScore: 'desc'
        }
      });

      // Find position (add 1 because array is 0-indexed)
      const position = allClassResults.findIndex(r => r.id === resultId) + 1;
      const totalStudents = allClassResults.length;

      updateData.position = position > 0 ? position : null;
      updateData.totalStudents = totalStudents;
    }

    const updated = await prisma.result.update({
      where: { id: resultId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating result:', error);
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}

// GET single result by ID (using POST for body params)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resultId } = body;

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID required' }, { status: 400 });
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true, arms: true } }
          }
        },
      }
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    // Get all results for position context
    const allClassResults = await prisma.result.findMany({
      where: {
        classId: result.classId,
        term: result.term,
        session: result.session,
        status: 'APPROVED'
      },
      orderBy: {
        totalScore: 'desc'
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    const position = allClassResults.findIndex(r => r.id === resultId) + 1;

    return NextResponse.json({
      id: result.id,
      studentId: result.studentId,
      studentName: result.student.user.name,
      studentNumber: result.student.studentId,
      className: result.student.class.name,
      arm: result.arm,
      term: result.term,
      session: result.session,
      subjects: result.subjects,
      totalScore: result.totalScore,
      averageScore: result.averageScore,
      position: position || result.position,
      totalStudents: allClassResults.length || result.totalStudents,
      status: result.status,
      submittedAt: result.submittedAt,
      classTeacherRemark: result.classTeacherRemark,
      principalRemark: result.principalRemark,
      recommendation: result.recommendation,
      allResults: allClassResults.map(r => ({
        id: r.id,
        studentName: r.student.user.name,
        totalScore: r.totalScore,
        position: allClassResults.findIndex(ar => ar.id === r.id) + 1
      }))
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
  }
}