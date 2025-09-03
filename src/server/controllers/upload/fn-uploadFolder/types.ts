// Interfaces
interface FileInfo {
    filename: string;
    relativePath: string;
    size: number;
    mimetype: string;
    hash?: string;
    buffer: Buffer;
}

interface ProcessedUpload {
    uploadedFiles: FileInfo[];
    totalSize: number;
    originalFolderName: string;
    folderPath: string;
    uploadId: string;
}

interface DatabaseSaveResult {
    carpetaId: number;
    archivosCreados: Array<{
        id: number;
        nombre: string;
        url: string;
    }>;
}

interface UploadResult {
    success: boolean;
    message: string;
    uploadedFiles?: Array<{
        id: number;
        filename: string;
        relativePath: string;
        size: number;
        url: string;
    }>;
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

export type {
    FileInfo,
    ProcessedUpload,
    DatabaseSaveResult,
    UploadResult
};