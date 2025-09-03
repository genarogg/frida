import type { ProcessedUpload, DatabaseSaveResult } from './types';
import { prisma } from "@fn"
import { UploadError } from './UploadError';


/**
 * PASO 4: Guardar información de archivos en base de datos
 * Input: ProcessedUpload (archivos ya guardados en disco) y ID de usuario
 * Output: DatabaseSaveResult con IDs creados en DB
 */
const saveToDatabase = async (
    diskResult: ProcessedUpload,
    usuarioId: number
): Promise<DatabaseSaveResult> => {

    console.log(`💾 Guardando en DB: ${diskResult.uploadedFiles.length} archivos para usuario ${usuarioId}`);

    try {
        return await prisma.$transaction(async (tx) => {
            // Crear carpeta principal
            const carpeta = await tx.carpeta.create({
                data: {
                    nombre: diskResult.originalFolderName,
                    ruta: diskResult.uploadId,
                    isPublic: false
                }
            });

            // Asociar carpeta con usuario
            await tx.usuarioCarpeta.create({
                data: {
                    usuarioId,
                    carpetaId: carpeta.id
                }
            });

            const archivosCreados = [];

            // Crear registros de archivos en lotes para mejor performance
            for (const fileInfo of diskResult.uploadedFiles) {
                // Crear archivo en DB
                const archivo = await tx.archivo.create({
                    data: {
                        nombre: fileInfo.filename,
                        tipo: fileInfo.mimetype,
                        size: fileInfo.size,
                        carpetaId: carpeta.id,
                        isPublic: false,
                        optimizado: false
                    }
                });

                // Crear ruta del archivo
                const fileUrl = `/private/${diskResult.uploadId}/${fileInfo.relativePath}`;
                await tx.ruta.create({
                    data: {
                        archivoId: archivo.id,
                        url: fileUrl
                    }
                });

                // Asociar archivo con usuario
                await tx.usuarioArchivo.create({
                    data: {
                        usuarioId,
                        archivoId: archivo.id
                    }
                });

                archivosCreados.push({
                    id: archivo.id,
                    nombre: archivo.nombre,
                    url: fileUrl
                });

                console.log(`✓ Guardado en DB: ${fileInfo.filename} (ID: ${archivo.id})`);
            }

            return {
                carpetaId: carpeta.id,
                archivosCreados
            };
        });

    } catch (error) {
        console.error('Error guardando en base de datos:', error);
        throw new UploadError('Error guardando archivos en base de datos', 'DATABASE_SAVE_ERROR', 500);
    }
}

export default saveToDatabase;