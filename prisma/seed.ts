import { PrismaClient } from '@prisma/client';
import participants from '../data/participants.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  for (const participant of participants) {
    await prisma.participant.create({
      data: {
        id: participant.id,
        name: participant.name,
        gender: participant.gender,
        benchKg: participant.benchKg,
        runTimeSeconds: participant.runTimeSeconds
      }
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 