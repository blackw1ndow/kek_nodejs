require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Усі суми — в копійках
const SETTINGS = {
  tuitionMonthly: 1500000, // 15 000 грн/міс
  yearlyDiscountPercent: 12, // знижка за оплату на рік (не діє на харчування)
  discountLevels: [10, 20, 30], // пільги на навчання
  mealBasePerDay: 30000, // 300 грн/день для 2-річних
  mealPerExtraYear: 10000, // +100 грн/день за кожен наступний рік
  roomMonthlyCost: 5000000, // 50 000 грн/міс
  defaultRoomsCount: 20,
  maxChildrenInGroup: 20,
  maxGroups: 30,
  groupExtraPayThreshold: 12, // доплата після 12 дітей у групі
  educatorPerChild: 200000, // 2 000 грн за дитину
  educatorExtraPay: 300000, // +3 000 грн після порогу
  assistantSalary: 2000000, // 20 000 грн
  assistantExtraPay: 300000, // +3 000 грн після порогу
  clubTeacherSalary: 4000000, // 40 000 грн
  managerSalary: 8000000, // 80 000 грн
};

const CLUBS = [
  { name: 'Музика', teacher: 'Викладач гуртка «Музика»' },
  { name: 'Англійська', teacher: 'Викладач гуртка «Англійська»' },
  { name: 'Шахи', teacher: 'Викладач гуртка «Шахи»' },
  { name: 'Малювання', teacher: 'Викладач гуртка «Малювання»' },
  { name: 'Танці', teacher: 'Викладач гуртка «Танці»' },
];

async function seedSettings() {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`Settings: ${Object.keys(SETTINGS).length}`);
}

async function seedClubs() {
  let created = 0;
  for (const [index, { name, teacher }] of CLUBS.entries()) {
    const exists = await prisma.club.findUnique({ where: { name } });
    if (exists) continue;

    const room = await prisma.room.upsert({
      where: { name: `Кабінет гуртка: ${name}` },
      update: {},
      create: {
        name: `Кабінет гуртка: ${name}`,
        type: 'CLUB',
        monthlyCost: SETTINGS.roomMonthlyCost,
      },
    });
    const staff = await prisma.staff.create({
      data: { fullName: `${teacher} #${index + 1}`, type: 'CLUB_TEACHER' },
    });
    await prisma.club.create({
      data: { name, roomId: room.id, teacherId: staff.id },
    });
    created += 1;
  }
  console.log(`Clubs: ${CLUBS.length} (created ${created})`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@kindergarten.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'ADMIN' },
  });
  console.log(`Admin: ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD не задано — використано пароль за замовчуванням (лише для dev!)');
  }
}

async function main() {
  await seedSettings();
  await seedClubs();
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());