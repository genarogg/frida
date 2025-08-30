import Fastify, { FastifyInstance } from 'fastify'
import Table from 'cli-table3';
import clear from "console-clear";
import colors from "colors";
import 'dotenv/config';

const { PORT } = process.env;
const server: FastifyInstance = Fastify({ logger: true})

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
  reactView
} from "./src/server/config"

const registerPlugins = async () => {
  await viewEJS(server);
  await staticFiles(server);
  graphql(server);
  await corsFastify(server);
  await reactView(server);

  if (process.env.NODE_ENV === "production") {
    await underPressureFastify(server);
    await caching(server)
    await rateLimit(server);
    await helmet(server);
    await compressFastify(server);
  }
}

import tack from "./src/server/tasks"

(async () => {
  clear();
  try {
    await registerPlugins()
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