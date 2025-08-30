const schemas = /* GraphQL */ `

##############################################
# Tipos básicos
##############################################

type Usuario {
  id: Int!
  name: String!
  email: String!
  rol: Rol!
  token: String!
}

type Meta {
  total: Int
  page: Int
  limit: Int
}

##############################################
# Tipos de datos paginados
##############################################


##############################################
# Tipos de response
##############################################

type UsuarioResponse {
  type: String
  message: String
  data: Usuario
}

type UsuariosResponse {
  type: String
  message: String
  data: [Usuario]
  meta: Meta
}

type NotificacionResponse {
  type: String
  message: String
}

##############################################
# Tipos de entrada
##############################################

input PDFDataInput {
  data: String!
}

##############################################
# Scalar
##############################################

scalar Upload
scalar Date

##############################################
# Query y Mutation
##############################################

type Query {
  hello: String
  generatePDF(template: String!, data: PDFDataInput!): String  
  validarSesion(token: String!): UsuarioResponse!
  getUsuario(token: String!, filtro: String): UsuariosResponse!
}

type Mutation {
  registerUsuario(
    token: String
    name: String!
    email: String!
    password: String!
    captchaToken: String
    rol: Rol
  ): UsuarioResponse!

  loginUsuario(
    email: String!, 
    password: String!, 
    captchaToken: String
    ): UsuarioResponse!

  resetPassword(email: String!): NotificacionResponse!

  resetPassWithToken(token: String!, nuevaContrasena: String!): UsuarioResponse!
}
`;

export default schemas;