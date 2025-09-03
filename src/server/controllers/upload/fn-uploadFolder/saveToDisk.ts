import path from 'path';
import type { FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import fs from 'fs/promises';
import crypto from 'crypto';
import { UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_TOTAL_SIZE, MAX_FILES_COUNT } from './config.js';
import { UploadError } from './UploadError.js';
import type { FileInfo, ProcessedUpload } from './types.js';

/**
 * PASO 3: Procesar archivos multipart y guardarlos en disco
 * Input: FastifyRequest con archivos multipart
 * Output: ProcessedUpload con información de archivos guardados en disco
 */
const saveToDisk = async (request: FastifyRequest): Promise<ProcessedUpload> => {
    // Validar headers de la request
    validateRequestHeaders(request);

    // Generar ID único y crear directorio
    const uploadId = generateUploadId();
    const folderPath = path.join(UPLOAD_DIR, uploadId);
    await ensureDirectoryExists(folderPath);

    const parts = request.parts();
    const uploadedFiles: FileInfo[] = [];
    let totalSize = 0;
    let originalFolderName = '';
    let fileCount = 0;

    // Procesar cada archivo del multipart
    for await (const part of parts) {
        if (part.type !== 'file') continue;

        const file = part as MultipartFile;
        fileCount++;

        console.log(`📄 Procesando archivo ${fileCount}: ${file.filename} (${file.mimetype})`);

        // Validar límites
        if (fileCount > MAX_FILES_COUNT) {
            throw new UploadError(`Demasiados archivos. Máximo: ${MAX_FILES_COUNT}`, 'TOO_MANY_FILES');
        }

        // Extraer y validar ruta relativa
        const relativePath = extractAndValidateRelativePath(file.fieldname, file.filename);

        if (!originalFolderName) {
            originalFolderName = extractFolderName(relativePath, file.filename);
        }

        // Leer archivo desde stream
        const { buffer, hash } = await readFileStreamSafely(file, fileCount);

        totalSize += buffer.length;
        if (totalSize > MAX_TOTAL_SIZE) {
            throw new UploadError(
                `Tamaño total excede límite: ${formatFileSize(MAX_TOTAL_SIZE)}`,
                'TOTAL_SIZE_EXCEEDED'
            );
        }

        // Guardar archivo en disco
        await saveFileSafely(buffer, folderPath, relativePath);

        // Agregar a lista de archivos procesados
        uploadedFiles.push({
            filename: file.filename || 'unknown_file',
            relativePath,
            size: buffer.length,
            mimetype: file.mimetype || 'application/octet-stream',
            hash,
            buffer
        });

        console.log(`✓ Guardado en disco: ${relativePath} (${formatFileSize(buffer.length)})`);
    }

    if (uploadedFiles.length === 0) {
        throw new UploadError('No se encontraron archivos válidos', 'NO_VALID_FILES');
    }

    return {
        uploadedFiles,
        totalSize,
        originalFolderName,
        folderPath,
        uploadId
    };
}

function validateRequestHeaders(request: FastifyRequest): void {
    const contentType = request.headers['content-type'];

    if (!contentType || !contentType.includes('multipart/form-data')) {
        throw new UploadError(
            'Content-Type inválido. Se requiere multipart/form-data',
            'INVALID_CONTENT_TYPE'
        );
    }

    const contentLength = request.headers['content-length'];
    if (contentLength && parseInt(contentLength) > MAX_TOTAL_SIZE) {
        throw new UploadError(
            `Tamaño de request excede el límite: ${formatFileSize(MAX_TOTAL_SIZE)}`,
            'REQUEST_TOO_LARGE',
            413
        );
    }
}

async function readFileStreamSafely(file: MultipartFile, fileIndex: number): Promise<{ buffer: Buffer, hash: string }> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        const hash = crypto.createHash('sha256');
        const timeout = setTimeout(() => {
            reject(new UploadError(`Timeout leyendo archivo ${fileIndex}`, 'FILE_READ_TIMEOUT'));
        }, 30000);

        file.file.on('data', (chunk: Buffer) => {
            size += chunk.length;

            if (size > MAX_FILE_SIZE) {
                clearTimeout(timeout);
                reject(new UploadError(
                    `Archivo ${file.filename} excede ${formatFileSize(MAX_FILE_SIZE)}`,
                    'FILE_TOO_LARGE'
                ));
                return;
            }

            chunks.push(chunk);
            hash.update(chunk);
        });

        file.file.on('end', () => {
            clearTimeout(timeout);
            const buffer = Buffer.concat(chunks);
            const hashString = hash.digest('hex');
            resolve({ buffer, hash: hashString });
        });

        file.file.on('error', (error) => {
            clearTimeout(timeout);
            reject(new UploadError(
                `Error leyendo archivo ${fileIndex}: ${error.message}`,
                'FILE_READ_ERROR'
            ));
        });
    });
}

async function saveFileSafely(buffer: Buffer, folderPath: string, relativePath: string): Promise<void> {
    const fullFilePath = path.join(folderPath, relativePath);
    const fileDir = path.dirname(fullFilePath);

    await ensureDirectoryExists(fileDir);

    const tempPath = `${fullFilePath}.tmp.${Date.now()}`;

    try {
        await fs.writeFile(tempPath, buffer);
        await fs.rename(tempPath, fullFilePath);
    } catch (error) {
        try {
            await fs.unlink(tempPath);
        } catch { }
        throw new UploadError(`Error guardando archivo: ${relativePath}`, 'FILE_SAVE_ERROR');
    }
}

function extractAndValidateRelativePath(fieldname: string, filename?: string): string {
    const match = fieldname.match(/files\[(.+)\]/);
    let relativePath = match ? match[1] : (filename || fieldname);

    relativePath = relativePath
        .replace(/[<>:"|?*\x00-\x1f]/g, '_')
        .replace(/\.+/g, '.')
        .replace(/^\/+|\/+$/g, '');

    if (relativePath.includes('..') || relativePath.length > 260) {
        throw new UploadError('Ruta de archivo inválida', 'INVALID_PATH');
    }

    const ext = path.extname(filename || relativePath).toLowerCase();
    if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
        throw new UploadError(`Extensión no permitida: ${ext}`, 'INVALID_EXTENSION');
    }

    return relativePath;
}

function extractFolderName(relativePath: string, filename?: string): string {
    if (relativePath.includes('/')) {
        return relativePath.split('/')[0];
    }
    return path.parse(filename || 'uploaded_files').name || 'uploaded_files';
}

function generateUploadId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `upload_${timestamp}_${random}`;
}



async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export { saveToDisk }