import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma, errorResponse } from "src/server/functions"


const verificarToken = async (token: string) => {
    const JWTSECRETO = process.env.JWTSECRETO || "jwt-secret";

    try {
        const payload = jwt.verify(token, JWTSECRETO) as JwtPayload | undefined;

        if (!payload || !payload.id) {
            console.error("Token inválido o sin ID");
            return { payload, isAuthenticated: false };
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: payload.id },
        });

        if (!usuario) {
            console.error("Usuario no encontrado");
            return { payload, isAuthenticated: false };
        }

        return { ...usuario, isAuthenticated: true };
    } catch (err) {
        console.error("Error al verificar el token:", err);
        return errorResponse({ message: "Error al verificar el token" });
    } finally {
        await prisma.$disconnect();
    }
};

export default verificarToken;