import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { promises as fs } from 'fs';
import path from 'path';

// Configuración
const UPLOAD_DIR = './uploads'; // Directorio base donde se guardarán las carpetas
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB por archivo
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total por carpeta

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

const upload = async (server: FastifyInstance): Promise<void> => {
  // Registrar el plugin de multipart
  await server.register(import('@fastify/multipart'), {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1000, // Máximo 1000 archivos por carpeta
    },
  });

  // Endpoint para subir carpeta completa
  server.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
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
      const filesToProcess: Array<{file: MultipartFile, relativePath: string, buffer: Buffer}> = [];

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
  });

  // Endpoint para listar archivos de una carpeta subida
  server.get('/upload/folder/:folderId/list', async (request: FastifyRequest<{
    Params: { folderId: string }
  }>, reply: FastifyReply) => {
    try {
      const { folderId } = request.params;
      const folderPath = path.join(UPLOAD_DIR, folderId);

      // Verificar que la carpeta existe
      if (!await directoryExists(folderPath)) {
        return reply.code(404).send({
          success: false,
          message: 'Carpeta no encontrada',
        });
      }

      const fileList = await getDirectoryStructure(folderPath);

      return reply.code(200).send({
        success: true,
        folderId,
        files: fileList,
        originalFolderName: folderId.includes('_') ? folderId.split('_')[0] : folderId,
      });

    } catch (error) {
      console.error('Error al listar archivos:', error);
      return reply.code(500).send({
        success: false,
        message: 'Error al listar archivos de la carpeta',
      });
    }
  });

  // Endpoint para descargar un archivo específico de una carpeta
  server.get('/upload/folder/:folderId/file/*', async (request: FastifyRequest<{
    Params: { folderId: string; '*': string }
  }>, reply: FastifyReply) => {
    try {
      const { folderId } = request.params;
      const filePath = request.params['*'];
      const fullPath = path.join(UPLOAD_DIR, folderId, filePath);

      // Verificar que el archivo existe y está dentro del directorio permitido
      if (!await fileExists(fullPath) || !isWithinDirectory(UPLOAD_DIR, fullPath)) {
        return reply.code(404).send({
          success: false,
          message: 'Archivo no encontrado',
        });
      }

      const stat = await fs.stat(fullPath);
      const filename = path.basename(fullPath);

      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.type('application/octet-stream');

      return reply.send(await fs.readFile(fullPath));

    } catch (error) {
      console.error('Error al descargar archivo:', error);
      return reply.code(500).send({
        success: false,
        message: 'Error al descargar el archivo',
      });
    }
  });

  // Endpoint para obtener información de una carpeta subida
  server.get('/upload/folder/:folderId/info', async (request: FastifyRequest<{
    Params: { folderId: string }
  }>, reply: FastifyReply) => {
    try {
      const { folderId } = request.params;
      const folderPath = path.join(UPLOAD_DIR, folderId);

      if (!await directoryExists(folderPath)) {
        return reply.code(404).send({
          success: false,
          message: 'Carpeta no encontrada',
        });
      }

      const stats = await getFolderStats(folderPath);
      
      return reply.code(200).send({
        success: true,
        folderId,
        originalFolderName: folderId.includes('_') ? folderId.split('_')[0] : folderId,
        totalFiles: stats.fileCount,
        totalSize: stats.totalSize,
        uploadPath: folderPath,
      });

    } catch (error) {
      console.error('Error al obtener información:', error);
      return reply.code(500).send({
        success: false,
        message: 'Error al obtener información de la carpeta',
      });
    }
  });
};

// Funciones auxiliares

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isWithinDirectory(parentDir: string, childPath: string): boolean {
  const resolvedParent = path.resolve(parentDir);
  const resolvedChild = path.resolve(childPath);
  return resolvedChild.startsWith(resolvedParent);
}

function extractRelativePathFromFieldname(fieldname: string): string {
  // Extrae la ruta relativa desde fieldnames como "files[folder/subfolder/file.txt]"
  const match = fieldname.match(/files\[(.+)\]/);
  const extracted = match ? match[1] : fieldname;
  console.log(`Extrayendo ruta de fieldname: ${fieldname} -> ${extracted}`);
  return extracted;
}

async function getDirectoryStructure(dirPath: string, basePath = ''): Promise<any[]> {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  const structure = [];

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    const relativePath = path.join(basePath, item.name);

    if (item.isDirectory()) {
      const subItems = await getDirectoryStructure(itemPath, relativePath);
      structure.push({
        type: 'directory',
        name: item.name,
        path: relativePath,
        children: subItems,
      });
    } else {
      const stat = await fs.stat(itemPath);
      structure.push({
        type: 'file',
        name: item.name,
        path: relativePath,
        size: stat.size,
        modified: stat.mtime,
      });
    }
  }

  return structure;
}

async function getFolderStats(dirPath: string): Promise<{fileCount: number, totalSize: number}> {
  let fileCount = 0;
  let totalSize = 0;

  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      const subStats = await getFolderStats(itemPath);
      fileCount += subStats.fileCount;
      totalSize += subStats.totalSize;
    } else {
      const stat = await fs.stat(itemPath);
      fileCount++;
      totalSize += stat.size;
    }
  }

  return { fileCount, totalSize };
}

export default upload;