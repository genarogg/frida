import Fastify, { FastifyInstance } from 'fastify'
import Table from 'cli-table3';
import clear from "console-clear";
import colors from "colors";
import 'dotenv/config';

const { PORT } = process.env;
const server: FastifyInstance = Fastify()

import {
  dbConection,
  viewEJS,
  staticFiles,
  graphql,
  caching,
  helmet,
  rateLimit,
  underPressureFastify,
  corsFastify,
  compressFastify,
  reactView,
  multipar
} from "./src/server/config"

const registerPlugins = async () => {
  // Plugins de configuración básica primero
  await helmet(server);
  await corsFastify(server);
  await compressFastify(server);
  
  // Plugins de parsing
  await multipar(server);
  
  // Plugins de vista y archivos estáticos
  await viewEJS(server);
  await staticFiles(server);
  await reactView(server);
  
  // Plugins de funcionalidad
  await graphql(server);
  
  // Plugins de rendimiento (en producción)
  if (process.env.NODE_ENV === "production") {
    await underPressureFastify(server);
    await caching(server);
    await rateLimit(server);
  }
}

import { uploadRouter } from "./src/server/routers/index"
import tack from "./src/server/tasks"

(async () => {
  clear();
  try {
    await registerPlugins()

    server.register(uploadRouter, { prefix: '/' })
    
    const port = Number(PORT) || 3500
    const dbStatus = await dbConection() || "";
    await server.listen({ port, host: '0.0.0.0' });

    const table = new Table({
      head: ['Servicio', 'URL'],
      colWidths: [20, 50]
    });

    /* ejecutar tareas programadas */
    tack()

    table.push(
      ['Servidor', colors.green(`http://localhost:${PORT}`)],
      ['Graphql', colors.green(`http://localhost:${PORT}/graphql`)],
      ['Documentacion', colors.cyan(`http://localhost:${PORT}/docs`)],
      ["db estatus", colors.cyan(dbStatus)]
    );

    console.log(table.toString());
  } catch (err) {
    console.log(err)
  }
})();

export default server;