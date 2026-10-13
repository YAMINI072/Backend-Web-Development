const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: { name: 'Demo author' },
    create: { id: 1, name: 'Demo author' },
  });

  const posts = [
    { id: 1, title: 'First post', body: 'The contract survives storage changes.' },
    { id: 2, title: 'Second post', body: 'Migrations record database design.' },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: { title: post.title, body: post.body, authorId: user.id },
      create: { ...post, authorId: user.id },
    });
  }

  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), (SELECT COALESCE(MAX("id"), 1) FROM "User"), true)`;
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"Post"', 'id'), (SELECT COALESCE(MAX("id"), 1) FROM "Post"), true)`;
}

main()
  .catch((error) => {
    console.error('Database seed failed');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
