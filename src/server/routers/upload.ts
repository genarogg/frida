import type { FastifyInstance } from 'fastify';
import { uploadFolderPost, getFiles } from '../controllers/upload';

const upload = async (server: FastifyInstance): Promise<void> => {
  // Endpoint para subir carpeta completa o archivos
  server.post('/upload', uploadFolderPost);
  server.post('/get-files', getFiles);
};

export default upload;