import userSeed from './user'
import permissionsSeed from './permissions'
import roleSeed from './role'
import countrySeed from './countrySeed'
import prisma from '@/db'

// import mailSeedConsole from './mailSeedConsole';  // make sure 'from' is included

async function main() {
  try {
    // Optional other seeds
    await permissionsSeed();
    await roleSeed();
    await userSeed();
    await countrySeed();

    // Run mail seed
    // const emails = await mailSeedConsole();

    // console.log(`\nTotal emails seeded for primary email: ${emails.length}`);
   
  } catch (err) {
    console.error('Error in main seeder:', err);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Seeding completed successfully.')
  })
  .catch(async e => {
    console.error('Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
