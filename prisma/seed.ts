import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...\n');

  console.log('ᡕᠵデᡁ᠊╾━ ✷ Creating admin and user accounts...');

  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordUser = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { user_name: 'admin' },
    update: {},
    create: {
      full_name: 'Admin User',
      user_name: 'admin',
      password: passwordAdmin,
      role: 'ADMIN',
      is_active: true,
    },
  });

  await prisma.user.upsert({
    where: { user_name: 'user' },
    update: {},
    create: {
      full_name: 'Regular User',
      user_name: 'user',
      password: passwordUser,
      role: 'USER',
      is_active: true,
    },
  });

  console.log('💀 Successfully seeded admin and user accounts.');

  // ADD MORE seeding logic here (e.g., seeding donations, requests, announcements etc.)

  console.log('\n🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
