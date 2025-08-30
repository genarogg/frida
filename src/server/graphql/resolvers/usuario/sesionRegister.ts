import {
    encriptarContrasena,
    crearBitacora,
    successResponse,
    errorResponse,
    prisma,
    verificarToken,
    generarToken,
    validarCapchat
} from "src/server/functions";
import { AccionesBitacora, Rol } from "@prisma/client";

interface RegisterUsuarioArgs {
    token?: string;
    name: string;
    email: string;
    password: string;
    rol?: Rol;
    captchaToken?: string;
}

const registerUsuario = async (_: unknown, args: RegisterUsuarioArgs) => {
    const { token, name, email, password, rol, captchaToken } = args;

    if (!name || !email || !password) {
        return errorResponse({ message: "Todos los campos son obligatorios" });
    }

    // Validar reCAPTCHA solo en entorno de producción
    if (process.env.NODE_ENV === "production") {
        if (!captchaToken) {
            return errorResponse({ message: "Captcha requerido" });
        }

        const captchaValido = await validarCapchat(captchaToken);

        if (!captchaValido) {
            return errorResponse({ message: "Captcha inválido" });
        }
    }

    try {
        const existe = await prisma.usuario.findUnique({ where: { email } });

        if (existe) {
            return errorResponse({ message: "El correo ya está registrado" });
        }

        let rolAsignado: Rol = Rol.USER;

        if (token) {
            const usuarioAutenticado = await verificarToken(token);

            if (!usuarioAutenticado.id) {
                return errorResponse({ message: "Token inválido o expirado" });
            }

            if (rol) {
                const rolValido = Object.values(Rol).includes(rol);
                if (!rolValido) {
                    return errorResponse({ message: "Rol inválido" });
                }

                const esAdmin = usuarioAutenticado.rol === Rol.ADMIN;
                const esAsistente = usuarioAutenticado.rol === Rol.ASISTENTE;

                // Definir roles permitidos para asistente
                const rolesPermitidosAsistente: Rol[] = [Rol.USER, Rol.CLIENTE];

                // Si es ASISTENTE, solo puede registrar USER o CLIENTE
                if (esAsistente && !rolesPermitidosAsistente.includes(rol)) {
                    return errorResponse({
                        message: "No tienes permisos para asignar este rol",
                    });
                }

                // Si no es ADMIN ni ASISTENTE, no puede asignar roles
                if (!esAdmin && !esAsistente) {
                    return errorResponse({
                        message: "No tienes permisos para registrar usuarios con rol",
                    });
                }

                rolAsignado = rol;
            }
        }

        const hashedPassword = await encriptarContrasena({ password });

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                name,
                email,
                password: hashedPassword,
                rol: rolAsignado,
            },
        });

        await crearBitacora({
            usuarioId: nuevoUsuario.id,
            accion: `registro de usuario con rol ${rolAsignado}`,
            type: AccionesBitacora.CREATE_USER,
        });

        // Generar token para el nuevo usuario
        const tokenGenerado = generarToken({ id: nuevoUsuario.id });

        return successResponse({
            message: "Usuario registrado correctamente",
            data: {
                id: nuevoUsuario.id,
                name: nuevoUsuario.name,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol,
                token: tokenGenerado,
            },
        });
    } catch (error) {
        console.error("Error en el registro:", error);
        return errorResponse({ message: "Error al registrar usuario" });
    } finally {
        await prisma.$disconnect();
    }
};

export default registerUsuario;