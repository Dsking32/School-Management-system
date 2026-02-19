import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET all sessions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        schoolId: school.id
      },
      include: {
        terms: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'desc'
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST create session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Session name is required' }, { status: 400 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if session exists
    const existing = await prisma.session.findFirst({
      where: {
        schoolId: school.id,
        name
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Session already exists' }, { status: 400 });
    }

    // Create session with default terms
    const newSession = await prisma.session.create({
      data: {
        name,
        schoolId: school.id,
        terms: {
          create: [
            { name: 'First Term', schoolId: school.id },
            { name: 'Second Term', schoolId: school.id },
            { name: 'Third Term', schoolId: school.id }
          ]
        }
      },
      include: {
        terms: true
      }
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PUT update session
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, isActive } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    // If setting this session as active, deactivate all others
    if (isActive) {
      // Deactivate all sessions
      await prisma.session.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });

      // Also deactivate all terms since session changed
      await prisma.term.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const updated = await prisma.session.update({
      where: { id },
      data: { name, isActive },
      include: { terms: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// DELETE session
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check if session has any results (through the Result model's session field)
    const resultsCount = await prisma.result.count({
      where: { session: (await prisma.session.findUnique({ where: { id } }))?.name }
    });

    if (resultsCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete session with existing results'
      }, { status: 400 });
    }

    // Delete terms first (they will cascade, but let's be explicit)
    await prisma.term.deleteMany({
      where: { sessionId: id }
    });

    // Then delete session
    await prisma.session.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}