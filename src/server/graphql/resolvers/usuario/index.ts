import registerUsuario from "./sesionRegister";
import loginUsuario from "./sesionLogin";
import resetPassword from "./resetSendEmail";
import resetPassWithToken from "./resetPassWithToken";

import validarSesion from "./sesionValidarSesion";
import getUsuario from "./getUsuario";

const resolvers = {
    Query: {
        validarSesion,
        getUsuario
    },
    
    Mutation: {
        registerUsuario,
        loginUsuario,
        resetPassword,
        resetPassWithToken
    }
};

export default resolvers;