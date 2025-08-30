import { PrismaClient } from '@prisma/client';
import { log } from "src/server/functions";

const dbConection = async () => {
    const prisma = new PrismaClient();

    try {
        await prisma.$connect();
        return "db conectada!";
    } catch (error: any) {
        log.error(`Error al conectar a la db: ${error.message}`);
    }

    process.on('SIGINT', async () => {
        await prisma.$disconnect();

        return "db desconectada!";
    });
}

export default dbConection;