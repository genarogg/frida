import fs from 'fs/promises';

async function cleanupOnError(folderPath: string): Promise<void> {
    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`🧹 Limpieza: ${folderPath}`);
    } catch (error) {
        console.error(`⚠️ Error limpiando: ${error}`);
    }
}

export default cleanupOnError;