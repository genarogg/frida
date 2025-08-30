import { encriptarContrasena, prisma } from "src/server/functions";
import { Rol } from "@prisma/client";

const seedUsers = async () => {
    const users = [
        {
            name: "Usuario",
            email: "usuario@gmail.com",
            password: "demo",
            rol: Rol.USER,
        },
        {
            name: "Administrador",
            email: "admin@admin.com",
            password: "admin",
            rol: Rol.ADMIN,
        },
        {
            name: "Asistente",
            email: "asistente@gmail.com",
            password: "demo",
            rol: Rol.ASISTENTE,
        },
        {
            name: "Cliente",
            email: "cliente@gmail.com",
            password: "demo",
            rol: Rol.CLIENTE,
        }
    ];

    for (const user of users) {
        const { name, email, password, rol } = user;
        const existingUser = await prisma.usuario.findUnique({
            where: { email: user.email },
        });

        if (!existingUser) {
            const hashedPassword = await encriptarContrasena({ password });
            await prisma.usuario.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    rol,
                },
            });
            console.log(`Usuario ${user.email} creado`);
        } else {
            console.log(`Usuario ${user.email} ya existe`);
        }
    }
};

export default seedUsers;