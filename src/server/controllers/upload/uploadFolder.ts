import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { promises as fs } from 'fs';
import path from 'path';

// Configuración
const UPLOAD_DIR = path.join(process.cwd(), "private");

const {
    MAX_FILE_SIZE: envMaxFileSize,
    MAX_TOTAL_SIZE: envMaxTotalSize
} = process.env;

const MAX_FILE_SIZE = Number(envMaxFileSize) * 1024 * 1024;
const MAX_TOTAL_SIZE = Number(envMaxTotalSize) * 1024 * 1024;

interface FileInfo {
    filename: string;
    relativePath: string;
    size: number;
    mimetype: string;
}

interface FolderUploadResponse {
    success: boolean;
    message: string;
    uploadedFiles: FileInfo[];
    totalSize: number;
    folderPath: string;
    originalFolderName: string;
}


const uploadFolderPost = async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Iniciando subida de carpeta...');
    try {
        // Asegurar que el directorio de uploads existe
        await ensureDirectoryExists(UPLOAD_DIR);

        const parts = request.parts();
        const uploadedFiles: FileInfo[] = [];
        let totalSize = 0;
        let originalFolderName = '';
        let folderPath = '';

        // Primera pasada: recopilar todos los archivos y determinar el nombre de la carpeta
        const filesToProcess: Array<{ file: MultipartFile, relativePath: string, buffer: Buffer }> = [];

        for await (const part of parts) {
            if (part.type === 'file') {
                const file = part as MultipartFile;

                // Obtener la ruta relativa desde el fieldname
                const relativePath = file.fieldname.startsWith('files[')
                    ? extractRelativePathFromFieldname(file.fieldname)
                    : file.filename || 'unknown_file';

                // Leer el buffer inmediatamente
                const buffer = await file.toBuffer();

                // Determinar el nombre de la carpeta raíz desde el primer archivo
                if (!originalFolderName) {
                    if (relativePath.includes('/')) {
                        // Extraer el nombre de la carpeta raíz
                        originalFolderName = relativePath.split('/')[0];
                        console.log(`Nombre de carpeta detectado: ${originalFolderName} desde ruta: ${relativePath}`);
                    } else {
                        // Si no hay estructura de carpetas, usar el nombre del archivo sin extensión
                        originalFolderName = path.parse(file.filename || 'uploaded_files').name || 'uploaded_files';
                        console.log(`Sin estructura de carpetas, usando: ${originalFolderName}`);
                    }
                }

                filesToProcess.push({ file, relativePath, buffer });
            }
        }

        if (filesToProcess.length === 0) {
            return reply.code(400).send({
                success: false,
                message: 'No se encontraron archivos para subir',
            });
        }

        // Generar un ID único para esta subida, pero mantener la estructura original
        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        folderPath = path.join(UPLOAD_DIR, uploadId);

        // Crear el directorio base de la subida
        await ensureDirectoryExists(folderPath);

        // Segunda pasada: guardar todos los archivos manteniendo la estructura exacta
        for (const { file, relativePath, buffer } of filesToProcess) {
            const fileSize = buffer.length;

            // Validar tamaño del archivo
            if (fileSize > MAX_FILE_SIZE) {
                throw new Error(`Archivo ${file.filename} excede el tamaño máximo permitido`);
            }

            totalSize += fileSize;

            // Validar tamaño total
            if (totalSize > MAX_TOTAL_SIZE) {
                throw new Error('El tamaño total de la carpeta excede el límite permitido');
            }

            // Usar directamente la ruta relativa completa que viene del frontend
            // Esto mantiene la estructura exacta: Nueva carpeta/Nuevo Documento de texto.txt
            const fullFilePath = path.join(folderPath, relativePath);
            const fileDir = path.dirname(fullFilePath);

            console.log(`Creando estructura: ${fileDir}`);
            console.log(`Ruta relativa original: ${relativePath}`);
            await ensureDirectoryExists(fileDir);

            // Guardar el archivo
            await fs.writeFile(fullFilePath, buffer);

            // Agregar información del archivo con la ruta relativa original
            uploadedFiles.push({
                filename: file.filename || 'unknown_file',
                relativePath,
                size: fileSize,
                mimetype: file.mimetype || 'application/octet-stream',
            });

            console.log(`Archivo guardado: ${fullFilePath}`);
        }

        if (uploadedFiles.length === 0) {
            return reply.code(400).send({
                success: false,
                message: 'No se encontraron archivos para subir',
            });
        }

        const response: FolderUploadResponse = {
            success: true,
            message: `Carpeta "${originalFolderName}" subida exitosamente con ${uploadedFiles.length} archivos`,
            uploadedFiles,
            totalSize,
            folderPath: path.basename(folderPath), // ID único de la subida
            originalFolderName, // Nombre original de la carpeta
        };

        return reply.code(200).send(response);

    } catch (error) {
        console.error('Error al subir carpeta:', error);
        return reply.code(500).send({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor',
        });
    }
}


async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

function extractRelativePathFromFieldname(fieldname: string): string {
    const match = fieldname.match(/files\[(.+)\]/);
    const extracted = match ? match[1] : fieldname;
    console.log(`Extrayendo ruta de fieldname: ${fieldname} -> ${extracted}`);
    return extracted;
}


export default uploadFolderPost