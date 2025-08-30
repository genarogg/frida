import type { FastifyInstance } from "fastify";
import FastifyVite from "@fastify/vite";
import { resolve } from "node:path";

const reactView = async (server: FastifyInstance) => {

    await server.register(FastifyVite, {
        root: resolve(process.cwd()),
        distDir: resolve(process.cwd(), 'dist', "src"),
        dev: process.env.NODE_ENV !== 'production',
        spa: true,
    })

    await server.vite.ready();

    server.get('/', (req, reply) => {
        return reply.html()
    })

    server.get('/headcheck', (req, reply) => {
        return reply.html()
    })

};

export default reactView;