
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora, encriptarContrasena, generarToken } from 'src/server/functions';

import { AccionesBitacora } from "@prisma/client";

interface resetPassWithTokenArgs {
    token: string;
    nuevaContrasena: string;
}

const resetPassWithToken = async (_: unknown, { token, nuevaContrasena }: resetPassWithTokenArgs) => {
    try {

        const { id: usuarioId } = await verificarToken(token);

        if (!usuarioId) {
            return errorResponse({ message: 'Token inválido o expirado' });
        }

        // Buscar usuario por ID
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: Number(usuarioId) },
        });

        if (!usuarioExistente) {
            return errorResponse({ message: 'Usuario no encontrado' });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await encriptarContrasena({
            password: nuevaContrasena
        })

        // Actualizar la contraseña del usuario
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: Number(usuarioId) },
            data: { password: hashedPassword }
        });


        // Crear una entrada en la bitácora
        crearBitacora({
            usuarioId: usuarioId,
            accion: `Cambio de contraseña`,
            mensaje: `El usuario ${usuarioActualizado.email} cambió su contraseña`,
            type: AccionesBitacora.CREATE_USER,
        });

        console.log(usuarioId)

        const tokenInit = generarToken({ id: Number(usuarioId) });

        return successResponse({
            message: 'Contraseña actualizada exitosamente',
            data: {
                ...usuarioActualizado,
                token: tokenInit
            }
        });
    } catch (error: any) {
        return errorResponse({ message: error.message });
    }
};

export default resetPassWithToken;