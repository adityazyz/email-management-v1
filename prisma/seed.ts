import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ Sample data in an array
const usersData = [
  {
    name: 'Alice',
    email: 'alice@example.com',
    posts: [
      {
        title: 'Welcome to Prisma',
        slug: 'welcome-to-prisma',
        content: 'This is a post about Prisma',
        published: true,
      },
      {
        title: 'Second Post',
        slug: 'second-post',
        content: 'Another post by Alice',
      },
    ],
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    posts: [
      {
        title: "Bob's First Post",
        slug: 'bob-first-post',
        content: 'Hello from Bob!',
        published: true,
      },
    ],
  },
];

async function main() {
  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        posts: {
          create: userData.posts,
        },
      },
    });
  }

  console.log('🌱 Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().then(() => process.exit(1));
  });
