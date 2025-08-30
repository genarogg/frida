# My Server Fastify

Servidor backend construido con [Fastify](https://fastify.dev/) para alto rendimiento, extensibilidad y bajo consumo de recursos. Este proyecto también integra soporte para GraphQL, vistas renderizadas, generación de PDF, y una base de datos administrada con Prisma ORM.

## Tecnologías Principales

| Tecnología / Paquete            | Propósito                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------- |
| **Fastify**                     | Framework backend rápido y eficiente.                                         |
| `@fastify/*` plugins            | Plugins para CORS, compresión, seguridad (Helmet), Swagger, renderizado, etc. |
| **Prisma ORM**                  | Modelado de datos y migraciones hacia la base de datos relacional.            |
| **TypeScript**                  | Tipado estático para mayor robustez del código.                               |
| **EJS**                         | Plantillas HTML renderizadas desde el servidor.                               |
| **GraphQL** (`@apollo/server`)  | Soporte para GraphQL API.                                                     |
| **React + @react-pdf/renderer** | Generación de PDFs usando componentes declarativos.                           |
| **Docker**                      | Contenerización y despliegue consistente.                                     |

## Estructura de Scripts

- `npm run dev` – Modo desarrollo con soporte a rutas TypeScript.
- `npm run build` – Compila a JavaScript, aplica alias y copia vistas.
- `npm run prisma` – Genera cliente y aplica migraciones de Prisma.
- `npm run production` – Compila y arranca servidor en modo producción.

## Seguridad y Optimización

- **Helmet**, **Rate Limit**, **Under Pressure** para protección básica.
- **fastify-metrics** para monitoreo de rendimiento.
- **argon2** para hash de contraseñas seguro.
- **jsonwebtoken** para autenticación basada en tokens.

## Otras Utilidades

- **node-cron** – Tareas programadas desde el servidor.
- **nodemailer** – Envío de correos electrónicos.
- **Swagger + Swagger UI** – Documentación de API interactiva.
- **serverless-http** – Adaptador para funcionar en entornos serverless (opcional).

## Requisitos

- Node.js >= 20
- Docker + Docker Compose (opcional para contenerización)

## Comandos útiles

```bash
# Ejecutar en desarrollo
npm run devs

# Generar PDF desde servidor
# (ver ruta/documentación en el código correspondiente)

# Construir para producción
npm run production
```
