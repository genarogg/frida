import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuración con valores más conservadores para evitar timeouts
const UPLOAD_DIR = path.join(process.cwd(), "private");
const ALLOWED_EXTENSIONS = new Set(['.txt', '.pdf', '.docx', '.jpg', '.png', '.gif', '.zip', '.json']);
const FORBIDDEN_NAMES = new Set(['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'lpt1', 'lpt2']);

// Configuración más conservadora para evitar timeouts
const {
    MAX_FILE_SIZE: envMaxFileSize = '10', // Reducido a 10MB por defecto
    MAX_TOTAL_SIZE: envMaxTotalSize = '100', // Reducido a 100MB por defecto
    MAX_FILES_COUNT: envMaxFiles = '100', // Reducido a 100 archivos
    UPLOAD_TIMEOUT: envUploadTimeout = '300000' // 5 minutos timeout
} = process.env;

const MAX_FILE_SIZE = Number(envMaxFileSize) * 1024 * 1024;
const MAX_TOTAL_SIZE = Number(envMaxTotalSize) * 1024 * 1024;
const MAX_FILES_COUNT = Number(envMaxFiles);
const UPLOAD_TIMEOUT = Number(envUploadTimeout);

// Configurar límites de Fastify
const FASTIFY_LIMITS = {
    fieldNameSize: 1000,
    fieldSize: MAX_FILE_SIZE,
    fields: 1000,
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT,
    headerPairs: 2000
};

interface FileInfo {
    filename: string;
    relativePath: string;
    size: number;
    mimetype: string;
    hash?: string;
}

interface FolderUploadResponse {
    success: boolean;
    message: string;
    uploadedFiles?: FileInfo[];
    totalSize?: number;
    folderPath?: string;
    originalFolderName?: string;
    uploadId?: string;
    timestamp?: number;
    error?: {
        code: string;
        details: string;
    };
}

class UploadError extends Error {
    constructor(message: string, public code: string, public statusCode: number = 400) {
        super(message);
        this.name = 'UploadError';
    }
}

// Función principal con manejo robusto de errores
const uploadFolderPost = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const startTime = Date.now();
    let uploadId = '';
    let folderPath = '';
    let cleanupRequired = false;

    // Configurar timeout para la request
    const timeoutId = setTimeout(() => {
        throw new UploadError('Timeout en la subida de archivos', 'UPLOAD_TIMEOUT', 408);
    }, UPLOAD_TIMEOUT);

    try {
        console.log('🚀 Iniciando subida de carpeta...');

        // Validaciones iniciales
        await validateEnvironment();
        await ensureDirectoryExists(UPLOAD_DIR);

        // Generar ID y crear directorio
        uploadId = generateUploadId();
        folderPath = path.join(UPLOAD_DIR, uploadId);
        cleanupRequired = true;

        console.log(`📁 ID de subida: ${uploadId}`);

        // Validar headers de la request
        validateRequestHeaders(request);

        // Procesar archivos con límites estrictos
        const result = await processUploadWithLimits(request, folderPath, uploadId);
        
        clearTimeout(timeoutId);
        cleanupRequired = false;

        const response: FolderUploadResponse = {
            success: true,
            message: result.message,
            uploadedFiles: result.uploadedFiles,
            totalSize: result.totalSize,
            folderPath: uploadId,
            originalFolderName: result.originalFolderName,
            uploadId,
            timestamp: startTime
        };

        console.log(`✅ Subida completada: ${uploadId} - ${Date.now() - startTime}ms`);
        reply.code(200).send(response);

    } catch (error) {
        clearTimeout(timeoutId);
        
        // Limpiar archivos parciales
        if (cleanupRequired && folderPath) {
            await cleanupOnError(folderPath);
        }

        console.error(`❌ Error en subida ${uploadId}:`, {
            message: error instanceof Error ? error.message : 'Error desconocido',
            stack: error instanceof Error ? error.stack : undefined,
            uploadId,
            duration: Date.now() - startTime
        });

        // Manejo específico de errores
        if (error instanceof UploadError) {
            return reply.code(error.statusCode).send({
                success: false,
                message: error.message,
                error: {
                    code: error.code,
                    details: getErrorDetails(error.code)
                }
            });
        }

        // Errores de conexión/red
        if (error instanceof Error) {
            if (error.message.includes('ECONNRESET') || error.message.includes('EPIPE')) {
                return reply.code(408).send({
                    success: false,
                    message: 'Conexión interrumpida durante la subida',
                    error: {
                        code: 'CONNECTION_INTERRUPTED',
                        details: 'La conexión se perdió mientras se subían los archivos. Intenta con archivos más pequeños o mejor conexión.'
                    }
                });
            }

            if (error.message.includes('ETIMEDOUT')) {
                return reply.code(408).send({
                    success: false,
                    message: 'Timeout en la subida',
                    error: {
                        code: 'UPLOAD_TIMEOUT',
                        details: 'La subida tardó demasiado. Reduce el tamaño de los archivos o el número total.'
                    }
                });
            }
        }

        // Error genérico del servidor
        reply.code(500).send({
            success: false,
            message: 'Error interno del servidor',
            error: {
                code: 'INTERNAL_ERROR',
                details: 'Error inesperado en el servidor. Contacta al administrador si persiste.'
            }
        });
    }
};

async function validateEnvironment(): Promise<void> {
    // Verificar permisos de escritura
    try {
        const testFile = path.join(UPLOAD_DIR, '.write_test');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
    } catch (error) {
        throw new UploadError('Sin permisos de escritura en directorio de subidas', 'NO_WRITE_PERMISSIONS', 500);
    }

    // Verificar espacio en disco
    try {
        const stats = await fs.stat(UPLOAD_DIR);
        // Implementar verificación de espacio si es necesario
    } catch (error) {
        console.warn('No se pudo verificar espacio en disco:', error);
    }
}

function validateRequestHeaders(request: FastifyRequest): void {
    const contentType = request.headers['content-type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
        throw new UploadError(
            'Content-Type inválido. Se requiere multipart/form-data',
            'INVALID_CONTENT_TYPE'
        );
    }

    // Verificar Content-Length si está disponible
    const contentLength = request.headers['content-length'];
    if (contentLength && parseInt(contentLength) > MAX_TOTAL_SIZE) {
        throw new UploadError(
            `Tamaño de request excede el límite: ${formatFileSize(MAX_TOTAL_SIZE)}`,
            'REQUEST_TOO_LARGE',
            413
        );
    }
}

async function processUploadWithLimits(
    request: FastifyRequest, 
    folderPath: string, 
    uploadId: string
): Promise<{
    message: string;
    uploadedFiles: FileInfo[];
    totalSize: number;
    originalFolderName: string;
}> {
    const parts = request.parts();
    const uploadedFiles: FileInfo[] = [];
    let totalSize = 0;
    let originalFolderName = '';
    let fileCount = 0;

    await ensureDirectoryExists(folderPath);

    for await (const part of parts) {
        if (part.type !== 'file') continue;

        const file = part as MultipartFile;
        fileCount++;

        // Log de progreso
        console.log(`📄 Procesando archivo ${fileCount}: ${file.filename} (${file.mimetype})`);

        // Validaciones
        if (fileCount > MAX_FILES_COUNT) {
            throw new UploadError(
                `Demasiados archivos. Máximo: ${MAX_FILES_COUNT}`,
                'TOO_MANY_FILES'
            );
        }

        const relativePath = extractAndValidateRelativePath(file.fieldname, file.filename);
        
        // Determinar nombre de carpeta
        if (!originalFolderName) {
            originalFolderName = extractFolderName(relativePath, file.filename);
        }

        // Leer y validar archivo
        const { buffer, hash } = await readFileStreamSafely(file, fileCount);
        
        totalSize += buffer.length;
        
        if (totalSize > MAX_TOTAL_SIZE) {
            throw new UploadError(
                `Tamaño total excede límite: ${formatFileSize(MAX_TOTAL_SIZE)}`,
                'TOTAL_SIZE_EXCEEDED'
            );
        }

        // Guardar archivo
        await saveFileSafely(buffer, folderPath, relativePath);

        uploadedFiles.push({
            filename: file.filename || 'unknown_file',
            relativePath,
            size: buffer.length,
            mimetype: file.mimetype || 'application/octet-stream',
            hash
        });

        // Log de éxito por archivo
        console.log(`✓ Guardado: ${relativePath} (${formatFileSize(buffer.length)})`);
    }

    if (uploadedFiles.length === 0) {
        throw new UploadError('No se encontraron archivos válidos', 'NO_VALID_FILES');
    }

    return {
        message: `Carpeta "${originalFolderName}" subida con ${uploadedFiles.length} archivos`,
        uploadedFiles,
        totalSize,
        originalFolderName
    };
}

async function readFileStreamSafely(file: MultipartFile, fileIndex: number): Promise<{ buffer: Buffer, hash: string }> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        const hash = crypto.createHash('sha256');
        const timeout = setTimeout(() => {
            reject(new UploadError(`Timeout leyendo archivo ${fileIndex}`, 'FILE_READ_TIMEOUT'));
        }, 30000); // 30 segundos por archivo

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

    // Escritura atómica
    const tempPath = `${fullFilePath}.tmp.${Date.now()}`;
    
    try {
        await fs.writeFile(tempPath, buffer);
        await fs.rename(tempPath, fullFilePath);
    } catch (error) {
        // Limpiar archivo temporal si falla
        try {
            await fs.unlink(tempPath);
        } catch {}
        throw new UploadError(`Error guardando archivo: ${relativePath}`, 'FILE_SAVE_ERROR');
    }
}

function extractAndValidateRelativePath(fieldname: string, filename?: string): string {
    const match = fieldname.match(/files\[(.+)\]/);
    let relativePath = match ? match[1] : (filename || fieldname);
    
    // Sanitizar ruta
    relativePath = relativePath
        .replace(/[<>:"|?*\x00-\x1f]/g, '_')
        .replace(/\.+/g, '.')
        .replace(/^\/+|\/+$/g, '');

    // Validaciones de seguridad
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

async function cleanupOnError(folderPath: string): Promise<void> {
    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`🧹 Limpieza: ${folderPath}`);
    } catch (error) {
        console.error(`⚠️ Error limpiando: ${error}`);
    }
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getErrorDetails(code: string): string {
    const details: Record<string, string> = {
        'CONNECTION_INTERRUPTED': 'La conexión se perdió. Verifica tu conexión a internet e intenta con archivos más pequeños.',
        'UPLOAD_TIMEOUT': 'La subida tardó demasiado. Reduce el tamaño o número de archivos.',
        'FILE_TOO_LARGE': 'Uno o más archivos son demasiado grandes.',
        'TOTAL_SIZE_EXCEEDED': 'El tamaño total de todos los archivos excede el límite.',
        'TOO_MANY_FILES': 'Demasiados archivos en la carpeta.',
        'INVALID_EXTENSION': 'Algunos archivos tienen extensiones no permitidas.',
        'NO_WRITE_PERMISSIONS': 'El servidor no tiene permisos para guardar archivos.',
        'INVALID_CONTENT_TYPE': 'El formato de la petición no es correcto.',
        'NO_VALID_FILES': 'No se encontraron archivos válidos para subir.'
    };
    
    return details[code] || 'Error desconocido durante la subida.';
}

// Configuración para Fastify (exportar para usar en tu app)
export const fastifyMultipartOptions = {
    limits: FASTIFY_LIMITS,
    addToBody: false, // Importante: no parsear automáticamente
};

export default uploadFolderPost;