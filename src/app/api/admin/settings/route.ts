import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET school settings
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

    // Get counts for statistics
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalResults
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.result.count(),
    ]);

    return NextResponse.json({
      school: {
        id: school.id,
        name: school.name,
        code: school.code,
      },
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalResults,
      },
      gradingSystem: {
        A: { min: 75, max: 100, remark: 'Excellent' },
        B: { min: 65, max: 74, remark: 'Very Good' },
        C: { min: 55, max: 64, remark: 'Good' },
        D: { min: 45, max: 54, remark: 'Pass' },
        F: { min: 0, max: 44, remark: 'Fail' },
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT update school settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'School name and code are required' }, { status: 400 });
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'No school found' }, { status: 500 });
    }

    // Check if code is already taken by another school
    if (code !== school.code) {
      const existingSchool = await prisma.school.findUnique({
        where: { code }
      });
      if (existingSchool) {
        return NextResponse.json({ error: 'School code already exists' }, { status: 400 });
      }
    }

    const updated = await prisma.school.update({
      where: { id: school.id },
      data: { name, code }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      code: updated.code,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}