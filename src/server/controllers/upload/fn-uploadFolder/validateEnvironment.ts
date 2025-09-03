import path from 'path';
import fs from 'fs/promises';
import { UPLOAD_DIR } from './config.js';
import { UploadError } from './UploadError.js';

/**
 * PASO 2: Validar que el entorno esté preparado para recibir archivos
 * Input: Ninguno (valida configuración global)
 * Output: Void (lanza excepción si hay problemas)
 */
const validateEnvironment = async (): Promise<void> => {
    try {
        const testFile = path.join(UPLOAD_DIR, '.write_test');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
    } catch (error) {
        throw new UploadError('Sin permisos de escritura en directorio de subidas', 'NO_WRITE_PERMISSIONS', 500);
    }
}

export { validateEnvironment }