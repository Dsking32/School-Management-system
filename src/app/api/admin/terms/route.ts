import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// PUT update term
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Term ID required' }, { status: 400 });
    }

    // Get the term with its session
    const term = await prisma.term.findUnique({
      where: { id },
      include: { session: true }
    });

    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    }

    // If trying to activate a term, check if its session is active
    if (isActive && !term.session.isActive) {
      return NextResponse.json({
        error: 'Cannot activate term because its session is not active. Please activate the session first.'
      }, { status: 400 });
    }

    // If setting this term as active, deactivate all others in the same session
    if (isActive) {
      await prisma.term.updateMany({
        where: {
          sessionId: term.sessionId,
          isActive: true
        },
        data: { isActive: false }
      });
    }

    const updated = await prisma.term.update({
      where: { id },
      data: { name, isActive },
      include: { session: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating term:', error);
    return NextResponse.json({ error: 'Failed to update term' }, { status: 500 });
  }
}