import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Create a PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function main() {
  console.log('🌱 Starting seed...');

  // Create school
  const school = await prisma.school.create({
    data: {
      name: 'Demo School',
      code: 'DEMO001'
    }
  });
  console.log('✅ School created');

  // Create admin
  await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      name: 'Admin User',
      schoolId: school.id,
      admin: {
        create: {
          schoolId: school.id
        }
      }
    }
  });
  console.log('✅ Admin created');

  // Create teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'john.okonkwo@school.com',
      password: await bcrypt.hash('password', 10),
      role: 'TEACHER',
      name: 'Mr. John Okonkwo',
      schoolId: school.id,
      teacher: {
        create: {
          teacherId: 'TCH001',
          classIds: ['JSS 1'],
          schoolId: school.id
        }
      }
    }
  });
  console.log('✅ Teacher created');

  // Create class
  const class1 = await prisma.class.create({
    data: {
      name: 'JSS 1',
      arms: ['A', 'B', 'C'],
      schoolId: school.id
    }
  });
  console.log('✅ Class created');

  // Create students
  const student1 = await prisma.user.create({
    data: {
      email: 'chidi.obi@school.com',
      password: await bcrypt.hash('password', 10),
      role: 'STUDENT',
      name: 'Chidi Obi',
      schoolId: school.id,
      student: {
        create: {
          studentId: 'STU001',
          dateOfBirth: new Date('2010-05-15'),
          classId: class1.id,
          arm: 'A',
          schoolId: school.id
        }
      }
    }
  });
  console.log('✅ Student Chidi created');

  const student2 = await prisma.user.create({
    data: {
      email: 'amina.suleiman@school.com',
      password: await bcrypt.hash('password', 10),
      role: 'STUDENT',
      name: 'Amina Suleiman',
      schoolId: school.id,
      student: {
        create: {
          studentId: 'STU002',
          dateOfBirth: new Date('2011-08-22'),
          classId: class1.id,
          arm: 'A',
          schoolId: school.id
        }
      }
    }
  });
  console.log('✅ Student Amina created');

  console.log('🎉 Seeding complete!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@school.com / admin123');
  console.log('Teacher: john.okonkwo@school.com / password');
  console.log('Student Chidi: STU001 / 2010-05-15');
  console.log('Student Amina: STU002 / 2011-08-22');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });