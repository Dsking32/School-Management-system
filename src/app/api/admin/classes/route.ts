import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET all classes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session in classes GET:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    if (!session.user) {
      return NextResponse.json({ error: 'No user in session' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'User is not admin' }, { status: 401 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    const classes = await prisma.class.findMany({
      where: {
        schoolId: school.id
      },
      orderBy: { name: 'asc' },
      include: {
        students: { select: { id: true } },
        subjects: { select: { id: true } }
      }
    });

    const formattedClasses = classes.map(c => ({
      id: c.id,
      name: c.name,
      arms: c.arms,
      studentCount: c.students.length,
      subjectCount: c.subjects.length,
    }));

    return NextResponse.json(formattedClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

// POST create class
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session in classes POST:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    if (!session.user) {
      return NextResponse.json({ error: 'No user in session' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'User is not admin' }, { status: 401 });
    }

    const body = await request.json();
    const { name, arms } = body;

    if (!name || !arms || arms.length === 0) {
      return NextResponse.json({ error: 'Name and arms are required' }, { status: 400 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if class already exists
    const existing = await prisma.class.findUnique({
      where: {
        schoolId_name: {
          schoolId: school.id,
          name: name
        }
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Class already exists' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        arms,
        schoolId: school.id
      }
    });

    return NextResponse.json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

// PUT update class
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, arms } = body;

    if (!id || !name || !arms) {
      return NextResponse.json({ error: 'ID, name and arms are required' }, { status: 400 });
    }

    const updated = await prisma.class.update({
      where: { id },
      data: { name, arms }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

// DELETE class
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Check if class has students
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        subjects: true
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.students.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete class with students. Remove students first.'
      }, { status: 400 });
    }

    if (classData.subjects.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete class with subjects. Remove subjects first.'
      }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}