import { PrismaClient } from '@prisma/client';

const ministerios = [
  'Departamento Staff',
  'Departamento Visión Juvenil',
  'Departamento Adoremos',
  'Departamento Escuela de Formación',
  'Ministerio Exploradores del Rey',
  'Departamento Salvación',
  'Departamento Audiovisuales',
  'Departamento Mujeres que Reinan',
  'Departamento Varones Amigos de Dios',
  'Departamento Danza Kadosh',
  'Departamento Intercesión',
  'Departamento Entrelazados',
  'Departamento Protocolo',
  'Departamento Servicio Social',
];

const prisma = new PrismaClient();

async function main() {
  for (const name of ministerios) {
    await prisma.groups.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Ministerios seedeados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
