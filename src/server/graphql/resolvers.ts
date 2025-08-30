import demoResolvers from "./resolvers/demo";
import pdfResolverResolvers from "./resolvers/pdf"
import usuarioResolver from "./resolvers/usuario";

const resolvers = {
    Query: {
        ...demoResolvers.Query,
        ...pdfResolverResolvers.Query,
        ...usuarioResolver.Query
    },

    Mutation: {
        ...usuarioResolver.Mutation,
    },
};

export default resolvers;