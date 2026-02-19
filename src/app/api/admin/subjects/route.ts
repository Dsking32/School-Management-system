import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET all subjects
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId: school.id,
        ...(classId && { classId })
      },
      include: {
        class: { select: { name: true, arms: true } },
        assignments: {
          include: {
            teacher: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: [
        { class: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const formatted = subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      classId: s.classId,
      className: s.class.name,
      classArms: s.class.arms,
      teacherId: s.assignments[0]?.teacherId || null,
      teacherName: s.assignments[0]?.teacher?.user?.name || 'Not Assigned',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

// POST create subject
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, classId } = body;

    if (!name || !code || !classId) {
      return NextResponse.json({ error: 'Name, code and class are required' }, { status: 400 });
    }

    // Get school
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if code already exists
    const existing = await prisma.subject.findUnique({
      where: { code }
    });

    if (existing) {
      return NextResponse.json({ error: 'Subject code already exists' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        schoolId: school.id
      },
      include: {
        class: { select: { name: true } }
      }
    });

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      classId: subject.classId,
      className: subject.class.name,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

// PUT update subject
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, classId, teacherId } = body;

    if (!id || !name || !code || !classId) {
      return NextResponse.json({ error: 'ID, name, code and class are required' }, { status: 400 });
    }

    // Get school
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if code is taken by another subject
    if (code) {
      const existing = await prisma.subject.findFirst({
        where: {
          code,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: 'Subject code already exists' }, { status: 400 });
      }
    }

    // Update subject
    const subject = await prisma.subject.update({
      where: { id },
      data: { name, code, classId },
      include: { class: { select: { name: true } } }
    });

    // Handle teacher assignment if provided
    if (teacherId) {
      // Check if assignment already exists
      const existingAssignment = await prisma.teacherAssignment.findUnique({
        where: {
          classId_subjectId: {
            classId,
            subjectId: id
          }
        }
      });

      if (existingAssignment) {
        // Update existing assignment
        await prisma.teacherAssignment.update({
          where: {
            classId_subjectId: {
              classId,
              subjectId: id
            }
          },
          data: { teacherId }
        });
      } else {
        // Create new assignment
        await prisma.teacherAssignment.create({
          data: {
            teacherId,
            classId,
            subjectId: id,
            schoolId: school.id
          }
        });
      }
    }

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      classId: subject.classId,
      className: subject.class.name,
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

// DELETE subject
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    // Check if subject has assignments
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { assignments: true }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (subject.assignments.length > 0) {
      // Delete assignments first
      await prisma.teacherAssignment.deleteMany({
        where: { subjectId: id }
      });
    }

    await prisma.subject.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}