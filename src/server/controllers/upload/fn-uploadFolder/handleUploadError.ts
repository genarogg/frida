import { FastifyReply } from 'fastify';
import { UploadError } from './UploadError.js';
import { errorResponse } from '@fn';
import getErrorDetails from './getErrorDetails';


async function handleUploadError(
    error: unknown,
    reply: FastifyReply,
    startTime: number
): Promise<void> {
    console.error(`❌ Error en subida:`, {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime
    });

    if (error instanceof UploadError) {
        const response = errorResponse({
            message: error.message,
            data: {
                code: error.code,
                details: getErrorDetails(error.code)
            },
            meta: {
                duration: Date.now() - startTime,
                timestamp: startTime
            }
        });

        return reply.code(error.statusCode).send(response);
    }

    if (error instanceof Error) {
        if (error.message.includes('ECONNRESET') || error.message.includes('EPIPE')) {
            const response = errorResponse({
                message: 'Conexión interrumpida durante la subida',
                data: {
                    code: 'CONNECTION_INTERRUPTED',
                    details: getErrorDetails('CONNECTION_INTERRUPTED')
                },
                meta: {
                    duration: Date.now() - startTime,
                    timestamp: startTime
                }
            });

            return reply.code(408).send(response);
        }

        if (error.message.includes('ETIMEDOUT')) {
            const response = errorResponse({
                message: 'Timeout en la subida',
                data: {
                    code: 'UPLOAD_TIMEOUT',
                    details: getErrorDetails('UPLOAD_TIMEOUT')
                },
                meta: {
                    duration: Date.now() - startTime,
                    timestamp: startTime
                }
            });

            return reply.code(408).send(response);
        }
    }

    const response = errorResponse({
        message: 'Error interno del servidor',
        data: {
            code: 'INTERNAL_ERROR',
            details: getErrorDetails('INTERNAL_ERROR')
        },
        meta: {
            duration: Date.now() - startTime,
            timestamp: startTime
        }
    });

    reply.code(500).send(response);
}

export default handleUploadError