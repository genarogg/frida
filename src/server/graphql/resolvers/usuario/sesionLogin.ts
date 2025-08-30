import {
    crearBitacora,
    successResponse,
    errorResponse,
    prisma,
    generarToken,
    compararContrasena,
    validarCapchat
} from "@fn";

import { AccionesBitacora } from "@prisma/client";

interface LoginUsuarioArgs {
    email: string;
    password: string;
    captchaToken?: string;
}

const loginUsuario = async (_: unknown, args: LoginUsuarioArgs) => {
    const { email, password, captchaToken } = args;

    if (!email || !password) {
        return errorResponse({ message: "Email y contraseña son obligatorios" });
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
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return errorResponse({ message: "Credenciales incorrectas" });
        }

        const passwordValida = await compararContrasena({
            password,
            hashedPassword: usuario.password
        });

        if (!passwordValida) {
            return errorResponse({ message: "Credenciales incorrectas" });
        }

        const token = generarToken({ id: usuario.id });

        await crearBitacora({
            usuarioId: usuario.id,
            accion: "inicio de sesión",
            type: AccionesBitacora.LOGIN
        });

        return successResponse({
            message: "Inicio de sesión exitoso",
            data: {
                id: usuario.id,
                name: usuario.name,
                email: usuario.email,
                rol: usuario.rol,
                token
            }
        });
    } catch (error) {
        console.error("Error en el login:", error);
        return errorResponse({ message: "Error al iniciar sesión" });
    }
};

export default loginUsuario;
