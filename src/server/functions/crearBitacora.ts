import { prisma } from "src/server/functions";
import { ip } from "address";
import { AccionesBitacora } from "@prisma/client";

interface CrearBitacoraArgs {
  usuarioId: number;
  accion: string;
  mensaje?: string;
  type: AccionesBitacora;
}

const crearBitacora = async ({
  usuarioId,
  accion,
  mensaje = "N/A",
  type,
}: CrearBitacoraArgs) => {
  try {
    const accionLimpia = accion.trim().toLowerCase();

    const myIP = ip() || "";

    const bitacora = await prisma.bitacora.create({
      data: {
        usuarioId,
        accion: accionLimpia,
        ip: myIP,
        mensaje,
        type,
      },
    });
    return bitacora;
  } catch (error) {
    console.error("Error al crear la bitácora:", error);
    throw new Error("No se pudo crear la bitácora");
  }
};

export default crearBitacora;
