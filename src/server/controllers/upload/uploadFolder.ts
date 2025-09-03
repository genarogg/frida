import type { FastifyRequest, FastifyReply } from 'fastify';
import { promises as fs } from 'fs';

import { verificarToken, successResponse, errorResponse } from '@fn';
import { validateEnvironment } from './fn-uploadFolder/validateEnvironment.js';
import { saveToDisk, saveToDatabase, cleanupOnError, handleUploadError } from './fn-uploadFolder';

const {

    UPLOAD_TIMEOUT: envUploadTimeout = '300000'
} = process.env;


const UPLOAD_TIMEOUT = Number(envUploadTimeout);

import { UploadError } from './fn-uploadFolder/UploadError.js';

/**
 * FUNCIÓN PRINCIPAL: Orquesta todo el proceso de subida
 * 1. Valida token y obtiene usuario
 * 2. Procesa archivos y los guarda en disco
 * 3. Guarda información en base de datos
 * 4. Retorna respuesta final
 */
const uploadFolderPost = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const startTime = Date.now();
    let cleanupPath = '';

    const timeoutId = setTimeout(() => {
        throw new UploadError('Timeout en la subida de archivos', 'UPLOAD_TIMEOUT', 408);
    }, UPLOAD_TIMEOUT);

    try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU2ODg0MDc5LCJleHAiOjE3NTcyNDQwNzl9.jTwvFjlLy5PuVgQkkY1zStCidRA4R9_1pIC1zO1JFYs"
        // 1. Validar token y obtener usuario
        const usuario = await verificarToken(token);

        // 2. Validar entorno y preparar subida
        await validateEnvironment();

        // 3. Procesar archivos y guardar en disco
        const diskResult = await saveToDisk(request);
        cleanupPath = diskResult.folderPath;

        // 4. Guardar en base de datos
        const dbResult = await saveToDatabase(diskResult, usuario.id);

        clearTimeout(timeoutId);

        // 5. Construir respuesta final usando el nuevo formato
        const uploadedFiles = diskResult.uploadedFiles.map((fileInfo, index) => ({
            id: dbResult.archivosCreados[index]?.id || 0,
            filename: fileInfo.filename,
            relativePath: fileInfo.relativePath,
            size: fileInfo.size,
            url: dbResult.archivosCreados[index]?.url || ''
        }));

        const responseData = {
            uploadedFiles,
            folderPath: diskResult.uploadId,
            originalFolderName: diskResult.originalFolderName,
            uploadId: diskResult.uploadId
        };

        const responseMeta = {
            totalSize: diskResult.totalSize,
            filesCount: diskResult.uploadedFiles.length,
            timestamp: startTime,
            duration: Date.now() - startTime
        };

        const response = successResponse({
            message: `Carpeta "${diskResult.originalFolderName}" subida con ${diskResult.uploadedFiles.length} archivos`,
            data: responseData,
            meta: responseMeta
        });

        console.log(`✅ Subida completada: ${diskResult.uploadId} - ${Date.now() - startTime}ms`);
        reply.code(200).send(response);

    } catch (error) {
        clearTimeout(timeoutId);

        if (cleanupPath) {
            await cleanupOnError(cleanupPath);
        }

        await handleUploadError(error, reply, startTime);
    }
};

// === FUNCIONES DE UTILIDAD ===




export default uploadFolderPost;