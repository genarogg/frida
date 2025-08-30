import {
    successResponse,
    errorResponse,
    prisma,
    verificarToken
} from "src/server/functions";
import { Rol } from "@prisma/client";

interface ObtenerUsuariosArgs {
    token: string;
    filtro?: string;
}

const obtenerUsuarios = async (_: unknown, args: ObtenerUsuariosArgs) => {

    const { token, filtro } = args;

    if (!token) {
        return errorResponse({ message: "Token requerido" });
    }

    try {
        // Verificar token y obtener usuario autenticado
        const usuarioAutenticado = await verificarToken(token);

        if ("type" in usuarioAutenticado && usuarioAutenticado.type === "error") {
            return errorResponse({ message: "Token inválido o expirado" });
        }

        // Si se proporciona un email específico, buscar solo ese usuario
        if (filtro) {

            const filtroCleaned = filtro.trim().toLowerCase();

            const usuario = await prisma.usuario.findUnique({
                where: { email: filtroCleaned },
                omit: { password: true }
            });

            if (!usuario) {
                return errorResponse({ message: "Usuario no encontrado" });
            }

            // Verificar permisos para ver este usuario específico
            const puedeVerUsuario = verificarPermisosUsuario({
                rolSolicitante: usuarioAutenticado.rol,
                rolObjetivo: usuario.rol
            });

            if (!puedeVerUsuario) {
                return errorResponse({ message: "No tienes permisos para ver este usuario" });
            }

            return successResponse({
                message: "Usuario encontrado",
                data: usuario
            });
        }

        // Determinar qué usuarios puede ver según su rol
        let whereCondition: any = {};

        switch (usuarioAutenticado.rol) {
            case Rol.ADMIN:
                // Los ADMIN pueden ver todos los ADMIN y ASISTENTE
                whereCondition = {
                    rol: {
                        in: [Rol.ADMIN, Rol.ASISTENTE]
                    }
                };
                break;

            case Rol.ASISTENTE:
                // Los ASISTENTE pueden ver todos los ASISTENTE
                whereCondition = {
                    rol: Rol.ASISTENTE
                };
                break;

            case Rol.USER:
                // Los USER pueden ver todos los USER
                whereCondition = {
                    rol: Rol.USER
                };
                break;

            case Rol.CLIENTE:
                // Los CLIENTE pueden ver todos los CLIENTE
                whereCondition = {
                    rol: Rol.CLIENTE
                };
                break;

            default:
                return errorResponse({ message: "Rol no válido" });
        }

        // Buscar usuarios según los permisos
        const usuarios = await prisma.usuario.findMany({
            where: whereCondition,
            omit: { password: true },
            orderBy: { createdAt: 'desc' },
        });

        const totalUsuarios = await prisma.usuario.count();

        return successResponse({
            message: "Usuarios obtenidos correctamente",
            data: usuarios,
            meta: {
                total: usuarios.length,
                page: totalUsuarios,
            }
        });

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return errorResponse({ message: "Error al obtener usuarios" });
    } finally {
        await prisma.$disconnect();
    }
};

// Función auxiliar para verificar permisos sobre un usuario específico
const verificarPermisosUsuario = ({
    rolSolicitante,
    rolObjetivo
}: {
    rolSolicitante: Rol,
    rolObjetivo: Rol
}): boolean => {
    switch (rolSolicitante) {
        case Rol.ADMIN:
            // Los ADMIN pueden ver ADMIN y ASISTENTE
            return rolObjetivo === Rol.ADMIN || rolObjetivo === Rol.ASISTENTE;

        case Rol.ASISTENTE:
            // Los ASISTENTE pueden ver solo ASISTENTE
            return rolObjetivo === Rol.ASISTENTE;

        case Rol.USER:
            // Los USER pueden ver solo USER
            return rolObjetivo === Rol.USER;

        case Rol.CLIENTE:
            // Los CLIENTE pueden ver solo CLIENTE
            return rolObjetivo === Rol.CLIENTE;

        default:
            return false;
    }
};

export default obtenerUsuarios;