import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), "private");
const ALLOWED_EXTENSIONS = new Set(['.txt', '.pdf', '.docx', '.jpg', '.png', '.gif', '.zip', '.json']);


const {
    MAX_FILE_SIZE: envMaxFileSize = '10',
    MAX_TOTAL_SIZE: envMaxTotalSize = '100',
    MAX_FILES_COUNT: envMaxFiles = '100',
    UPLOAD_TIMEOUT: envUploadTimeout = '300000'
} = process.env;

const MAX_FILE_SIZE = Number(envMaxFileSize) * 1024 * 1024;
const MAX_TOTAL_SIZE = Number(envMaxTotalSize) * 1024 * 1024;
const MAX_FILES_COUNT = Number(envMaxFiles);
const UPLOAD_TIMEOUT = Number(envUploadTimeout);


const FASTIFY_LIMITS = {
    fieldNameSize: 1000,
    fieldSize: MAX_FILE_SIZE,
    fields: 1000,
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT,
    headerPairs: 2000
};


export {
    UPLOAD_DIR,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    MAX_TOTAL_SIZE,
    MAX_FILES_COUNT,
    UPLOAD_TIMEOUT,
    FASTIFY_LIMITS
}