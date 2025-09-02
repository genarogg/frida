import type { FastifyRequest, FastifyReply } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), "private");

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    path: string;
    relativePath: string;
    size?: number;
    mimetype?: string;
    lastModified?: Date;
    children?: FileNode[];
}

interface FolderStructureResponse {
    success: boolean;
    message: string;
    folderName: string;
    structure: FileNode;
    totalFiles: number;
    totalSize: number;
}

interface GetFolderParams {
    folderId: string;
}

const getFolderStructure = async (request: FastifyRequest<{
    Params: GetFolderParams
}>, reply: FastifyReply) => {
    try {

        console.log('Obteniendo estructura de carpeta...');

        const folderId  = "upload_1756793270858_n94verrtr"

        if (!folderId) {
            return reply.code(400).send({
                success: false,
                message: 'ID de carpeta requerido'
            });
        }

        const folderPath = path.join(UPLOAD_DIR, folderId);

        // Verificar que la carpeta existe
        try {
            await fs.access(folderPath);
        } catch {
            return reply.code(404).send({
                success: false,
                message: 'Carpeta no encontrada'
            });
        }

        // Construir la estructura de archivos
        const structure = await buildFileTree(folderPath, '');
        const stats = await calculateFolderStats(folderPath);

        const response: FolderStructureResponse = {
            success: true,
            message: 'Estructura de carpeta obtenida exitosamente',
            folderName: folderId,
            structure,
            totalFiles: stats.totalFiles,
            totalSize: stats.totalSize
        };

        console.log(response)

        return reply.code(200).send(response);

    } catch (error) {
        console.error('Error al obtener estructura de carpeta:', error);
        return reply.code(500).send({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

async function buildFileTree(fullPath: string, relativePath: string): Promise<FileNode> {
    const stats = await fs.stat(fullPath);
    const name = path.basename(fullPath);

    if (stats.isDirectory()) {
        const children: FileNode[] = [];
        const items = await fs.readdir(fullPath);

        // Ordenar: carpetas primero, luego archivos
        items.sort((a: any, b: any): any => {
            const aPath = path.join(fullPath, a);
            const bPath = path.join(fullPath, b);
            const aStat = fs.stat(aPath);
            const bStat = fs.stat(bPath);

            return Promise.all([aStat, bStat]).then(([aStats, bStats]) => {
                if (aStats.isDirectory() && !bStats.isDirectory()) return -1;
                if (!aStats.isDirectory() && bStats.isDirectory()) return 1;
                return a.localeCompare(b);
            });
        });

        for (const item of items) {
            const itemPath = path.join(fullPath, item);
            const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
            const childNode = await buildFileTree(itemPath, itemRelativePath);
            children.push(childNode);
        }

        return {
            name,
            type: 'folder',
            path: fullPath,
            relativePath,
            lastModified: stats.mtime,
            children
        };
    } else {
        // Es un archivo
        const mimetype = getMimeType(name);

        return {
            name,
            type: 'file',
            path: fullPath,
            relativePath,
            size: stats.size,
            mimetype,
            lastModified: stats.mtime
        };
    }
}

async function calculateFolderStats(folderPath: string): Promise<{ totalFiles: number; totalSize: number }> {
    let totalFiles = 0;
    let totalSize = 0;

    async function traverse(currentPath: string) {
        const items = await fs.readdir(currentPath);

        for (const item of items) {
            const itemPath = path.join(currentPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                await traverse(itemPath);
            } else {
                totalFiles++;
                totalSize += stats.size;
            }
        }
    }

    await traverse(folderPath);
    return { totalFiles, totalSize };
}

function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.txt': 'text/plain',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.ts': 'application/typescript'
    };

    return mimeTypes[ext] || 'application/octet-stream';
}

export default getFolderStructure;