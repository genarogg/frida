import type { FastifyInstance } from "fastify"
import multipart from '@fastify/multipart';

const multipar = (server: FastifyInstance) => {
    const { MAX_FILE_SIZE } = process.env;

    return server.register(multipart, {
        limits: {
            fileSize: Number(MAX_FILE_SIZE) * 1024 * 1024,
            files: 1000,
        },
    });
}

export default multipar;