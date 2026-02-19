import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// GET all students
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const arm = searchParams.get('arm');
    const search = searchParams.get('search');

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    const students = await prisma.student.findMany({
      where: {
        schoolId: school.id,
        ...(classId && { classId }),
        ...(arm && { arm }),
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { studentId: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        user: { select: { name: true, email: true } },
        class: { select: { name: true } }
      },
      orderBy: { user: { name: 'asc' } }
    });

    const formatted = students.map(s => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      studentId: s.studentId,
      dateOfBirth: s.dateOfBirth.toISOString().split('T')[0],
      classId: s.classId,
      className: s.class.name,
      arm: s.arm,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST create student
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, studentId, dateOfBirth, classId, arm } = body;

    // Validate input
    if (!name || !email || !studentId || !dateOfBirth || !classId || !arm) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Get school first
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check existing using compound unique constraint
    const [existingStudent, existingUser] = await Promise.all([
      prisma.student.findUnique({ 
        where: { 
          schoolId_studentId: {
            schoolId: school.id,
            studentId: studentId
          }
        } 
      }),
      prisma.user.findUnique({ where: { email } })
    ]);

    if (existingStudent) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
    }
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(studentId.toLowerCase(), 10);

    // Use $transaction correctly
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { 
          email, 
          password: hashedPassword, 
          role: 'STUDENT', 
          name, 
          schoolId: school.id 
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId,
          dateOfBirth: new Date(dateOfBirth),
          classId,
          arm,
          schoolId: school.id,
        },
        include: { 
          user: true, 
          class: true 
        }
      });

      return student;
    });

    return NextResponse.json({
      id: result.id,
      name: result.user.name,
      email: result.user.email,
      studentId: result.studentId,
      dateOfBirth: result.dateOfBirth.toISOString().split('T')[0],
      classId: result.classId,
      className: result.class.name,
      arm: result.arm,
      defaultPassword: studentId.toLowerCase(),
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

// PUT update student
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, studentId, dateOfBirth, classId, arm } = body;

    if (!id || !name || !email || !studentId || !dateOfBirth || !classId || !arm) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get school
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if studentId is taken by another student (using compound unique)
    if (studentId !== student.studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { 
          schoolId_studentId: {
            schoolId: school.id,
            studentId: studentId
          }
        }
      });
      if (existingStudent) {
        return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
      }
    }

    // Check if email is taken by another user
    if (email !== student.user.email) {
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
        where: { id: student.userId },
        data: { name, email }
      });

      const updated = await tx.student.update({
        where: { id },
        data: {
          studentId,
          dateOfBirth: new Date(dateOfBirth),
          classId,
          arm,
        },
        include: { 
          user: true, 
          class: true 
        }
      });

      return updated;
    });

    return NextResponse.json({
      id: result.id,
      name: result.user.name,
      email: result.user.email,
      studentId: result.studentId,
      dateOfBirth: result.dateOfBirth.toISOString().split('T')[0],
      classId: result.classId,
      className: result.class.name,
      arm: result.arm,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if student has results
    const results = await prisma.result.findMany({
      where: { studentId: id }
    });

    if (results.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete student with existing results. Delete results first.' 
      }, { status: 400 });
    }

    // Use $transaction correctly
    await prisma.$transaction([
      prisma.student.delete({ where: { id } }),
      prisma.user.delete({ where: { id: student.userId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}