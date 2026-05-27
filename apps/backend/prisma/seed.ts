import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@food.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: uuid(),
        email: adminEmail,
        passwordHash: await bcrypt.hash('admin1234', 10),
        name: 'Admin',
        role: 'ADMIN'
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Seeded admin: ${adminEmail} / admin1234`);
  }

  const products = [
    { name: 'Pizza Muzzarella', description: 'Salsa, muzzarella y aceitunas', priceInCents: 600000, category: 'PIZZA' as const },
    { name: 'Pizza Napolitana', description: 'Con tomate fresco y ajo', priceInCents: 650000, category: 'PIZZA' as const },
    { name: 'Hamburguesa Clásica', description: 'Carne, queso, lechuga, tomate', priceInCents: 450000, category: 'BURGER' as const },
    { name: 'Hamburguesa Doble Cheddar', description: 'Doble carne, doble cheddar', priceInCents: 550000, category: 'BURGER' as const },
    { name: 'Papas Fritas Chicas', description: 'Porción individual', priceInCents: 200000, category: 'FRIES' as const },
    { name: 'Papas Fritas Grandes', description: 'Para compartir', priceInCents: 350000, category: 'FRIES' as const },
    { name: 'Coca-Cola 500ml', description: 'Botella', priceInCents: 150000, category: 'DRINK' as const },
    { name: 'Coca-Cola Zero 500ml', description: 'Botella', priceInCents: 150000, category: 'DRINK' as const },
    { name: 'Sprite 500ml', description: 'Botella', priceInCents: 150000, category: 'DRINK' as const }
  ];

  for (const p of products) {
    const found = await prisma.product.findFirst({ where: { name: p.name } });
    if (!found) {
      await prisma.product.create({
        data: {
          id: uuid(),
          name: p.name,
          description: p.description,
          priceInCents: p.priceInCents,
          currency: 'ARS',
          category: p.category,
          available: true
        }
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log('Seed completed.');
}

main()
  .catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
