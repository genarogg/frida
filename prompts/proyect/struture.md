# Estructura del Proyecto

```text
├── prisma
│   └── schema.prisma
├── prompts
│   ├── 1-user_rules.md
│   ├── 2-proyect-rules.md
│   └── 3-tecnologis.md
├── public
│   ├── css
│   │   └── healthcheck.css
│   └── isotipo.svg
├── scripts
│   └── add-js-ext.js
├── src
│   ├── config
│   │   └── db-conection.ts
│   ├── controllers
│   │   └── index.ts
│   ├── email
│   │   ├── ejs
│   │   │   └── resetPassWord.ejs
│   │   ├── compileEJSTemplate.ts
│   │   ├── index.ts
│   │   ├── mailer.ts
│   │   └── sendEmail.ts
│   ├── functions
│   │   ├── crearBitacora.ts
│   │   ├── encriptarContrasena.ts
│   │   ├── generarToken.ts
│   │   ├── index.ts
│   │   ├── log.ts
│   │   ├── prisma.ts
│   │   ├── response.ts
│   │   ├── validarCapchat.ts
│   │   └── verificarToken.ts
│   ├── graphql
│   │   ├── resolvers
│   │   │   ├── demo
│   │   │   │   ├── hello.ts
│   │   │   │   └── index.ts
│   │   │   ├── pdf
│   │   │   │   ├── generatePDF.ts
│   │   │   │   └── index.ts
│   │   │   └── usuario
│   │   │       └── login.ts
│   │   ├── enums.ts
│   │   ├── index.ts
│   │   ├── resolvers.ts
│   │   ├── schemas.ts
│   │   └── schemasBuild.ts
│   ├── pdf
│   │   ├── HelloWorldTemplate.tsx
│   │   └── index.ts
│   ├── routers
│   │   ├── healthcheck.ts
│   │   └── index.ts
│   ├── tasks
│   │   └── index.ts
│   └── views
│       └── healthcheck
│           └── index.ejs
├── .env
├── index.ts
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
