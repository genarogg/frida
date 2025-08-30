import { prisma, log } from "src/server/functions";
import seedUsers from "./seedUsers";


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const seed = async () => {
    try {

        const adminUser = await prisma.usuario.findUnique({
            where: { email: "admin@admin.com" },
        });

        if (adminUser) {
            log.info("Usuario admin@admin.com ya existe. Saltando la creación de usuarios.");
            return;
        }

        await seedUsers();
        await delay(1000);

        log.info("Usuarios creados exitosamente.");
    } catch (error) {
        console.error("Error al sembrar la base de datos:", error);
    }
};

export default seed;