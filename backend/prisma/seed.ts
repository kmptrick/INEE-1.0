import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { firstName: 'Patrick',  lastName: 'KUETE MOMO',  email: 'patrick.kuete@inee.lu',  role: 'ADMIN',  tempPwd: 'Inee2026!P' },
  { firstName: 'Lorraine', lastName: 'ASSAN',        email: 'lorraine.assan@inee.lu',  role: 'MEMBER', tempPwd: 'Inee2026!L' },
  { firstName: 'Claire',   lastName: 'BRICUSSE',     email: 'claire.bricusse@inee.lu', role: 'MEMBER', tempPwd: 'Inee2026!C' },
  { firstName: 'Hélène',   lastName: 'BRICUSSE',     email: 'helene.bricusse@inee.lu', role: 'MEMBER', tempPwd: 'Inee2026!H' },
];

async function main() {
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  ↩ Déjà existant : ${u.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(u.tempPwd, 12);
    await prisma.user.create({
      data: { firstName: u.firstName, lastName: u.lastName, email: u.email, password: hashed, role: u.role as any },
    });
    console.log(`  ✓ Créé : ${u.firstName} ${u.lastName} <${u.email}> — mdp temp : ${u.tempPwd}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
