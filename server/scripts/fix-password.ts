/**
 * Script para restablecer la contraseña de un usuario por email.
 * Uso: npx ts-node -r tsconfig-paths/register scripts/fix-password.ts samuellastre321@gmail.com
 * O:   pnpm exec ts-node -r tsconfig-paths/register scripts/fix-password.ts samuellastre321@gmail.com
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const NEW_PASSWORD = '12345678';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: npx ts-node scripts/fix-password.ts <email>');
    process.exit(1);
  }

  console.log('Buscando usuario:', email);

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
    },
  });

  if (!user) {
    console.error('Usuario no encontrado');
    process.exit(1);
  }

  console.log('Usuario encontrado:', user.id, user.name || user.email);
  console.log('isActive:', user.isActive);
  console.log('Tiene password:', !!user.password);
  if (user.password) {
    console.log('Hash comienza con:', user.password.substring(0, 10) + '...');
  }

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, isActive: true },
  });

  const verify = await bcrypt.compare(NEW_PASSWORD, hashedPassword);
  console.log('Verificación bcrypt.compare:', verify ? 'OK' : 'FALLO');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  const verifyStored = dbUser?.password
    ? await bcrypt.compare(NEW_PASSWORD, dbUser.password)
    : false;
  console.log('Verificación contra DB:', verifyStored ? 'OK' : 'FALLO');

  console.log('\nContraseña restablecida a:', NEW_PASSWORD);
  console.log('Ahora intenta iniciar sesión con ese email y contraseña.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
