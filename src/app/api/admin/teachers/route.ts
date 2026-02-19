import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// GET all teachers
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: school.id
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { user: { name: 'asc' } }
    });

    const formatted = teachers.map(t => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      teacherId: t.teacherId,
      classIds: t.classIds,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

// POST create teacher
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, teacherId, classIds } = body;

    // Validate input
    if (!name || !email || !teacherId) {
      return NextResponse.json({ error: 'Name, email and teacher ID are required' }, { status: 400 });
    }

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check existing - Note: Teacher doesn't have a compound unique constraint
    // We need to check by teacherId and schoolId separately
    const [existingTeacher, existingUser] = await Promise.all([
      prisma.teacher.findFirst({ 
        where: { 
          teacherId: teacherId,
          schoolId: school.id
        } 
      }),
      prisma.user.findUnique({ where: { email } })
    ]);

    if (existingTeacher) {
      return NextResponse.json({ error: 'Teacher ID already exists in this school' }, { status: 400 });
    }
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(teacherId.toLowerCase(), 10);

    // Use $transaction correctly
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { 
          email, 
          password: hashedPassword, 
          role: 'TEACHER', 
          name, 
          schoolId: school.id 
        }
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          teacherId,
          classIds: classIds || [],
          schoolId: school.id,
        },
        include: { user: true }
      });

      return teacher;
    });

    return NextResponse.json({
      id: result.id,
      name: result.user.name,
      email: result.user.email,
      teacherId: result.teacherId,
      classIds: result.classIds,
      defaultPassword: teacherId.toLowerCase(),
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}

// PUT update teacher
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, teacherId, classIds } = body;

    if (!id || !name || !email || !teacherId) {
      return NextResponse.json({ error: 'ID, name, email and teacher ID are required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get school
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if teacherId is taken by another teacher
    if (teacherId !== teacher.teacherId) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: { 
          teacherId: teacherId,
          schoolId: school.id,
          NOT: { id: id }
        }
      });
      if (existingTeacher) {
        return NextResponse.json({ error: 'Teacher ID already exists in this school' }, { status: 400 });
      }
    }

    // Check if email is taken by another user
    if (email !== teacher.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Use $transaction correctly
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: teacher.userId },
        data: { name, email }
      });

      const updated = await tx.teacher.update({
        where: { id },
        data: { 
          teacherId, 
          classIds: classIds || [] 
        },
        include: { user: true }
      });

      return updated;
    });

    return NextResponse.json({
      id: result.id,
      name: result.user.name,
      email: result.user.email,
      teacherId: result.teacherId,
      classIds: result.classIds,
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

// DELETE teacher
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { 
        user: true,
        assignments: true 
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Check if teacher has assignments
    if (teacher.assignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete teacher with subject assignments. Remove assignments first.' 
      }, { status: 400 });
    }

    // Use $transaction correctly
    await prisma.$transaction([
      prisma.teacher.delete({ where: { id } }),
      prisma.user.delete({ where: { id: teacher.userId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}