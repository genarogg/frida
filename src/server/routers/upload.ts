import type { FastifyInstance } from 'fastify';
import uploadFolderPost from '../controllers/upload/uploadFolder';


const upload = async (server: FastifyInstance): Promise<void> => {
  // Endpoint para subir carpeta completa o archivos
  server.post('/upload', uploadFolderPost);
};

export default upload;