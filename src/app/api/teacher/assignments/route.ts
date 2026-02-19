import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET teacher's assignments (classes and subjects)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher details
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

    // Get all classes where teacher is assigned (via classIds array)
    const classes = await prisma.class.findMany({
      where: {
        id: {
          in: teacher.classIds
        }
      },
      include: {
        subjects: {
          include: {
            assignments: {
              where: {
                teacherId: teacher.id
              },
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    // Format response
    const formatted = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      arms: cls.arms,
      subjects: cls.subjects
        .filter(subj => subj.assignments.length > 0)
        .map(subj => ({
          id: subj.id,
          name: subj.name,
          code: subj.code
        }))
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}