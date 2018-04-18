const { resolve: urlResolve } = require("url");
const rp = require("request-promise-native");
const { makeExecutableSchema } = require("graphql-tools");
const { executeGqlLambda } = require("../helpers.js");

const typeDefs = `
type Query {
  greeting(firstName: String!): String
  engineHealth: Boolean
}

schema {
  query: Query
}
`;

const resolvers = {
  Query: {
    greeting(parent, args, context, { cacheControl }) {
      cacheControl.setCacheHint({ maxAge: 60 });
      return `Hello, ${args.firstName}.`;
    },
    engineHealth() {
      if (!process.env.ENGINE_PROXY_URL ||
        // Avoid a serverless test bug where the dynamic env variable is
        // passed as "[object Object]" when it tries to emulate it.
        !process.env.ENGINE_PROXY_URL.startsWith("http")) {
        return false;
      }

      return rp({
          uri: urlResolve(process.env.ENGINE_PROXY_URL,
            "/.well-known/apollo/engine-health"),
          resolveWithFullResponse: true,
        })

        // The Engine Proxy returns status code 200 when all is well.
        .then((response) => response.statusCode === 200)

        // If an error occurs, we swallow it for now and just return false.
        .catch(err => {
          console.error(
            "Couldn't verify Engine Health due to an error:", err);
          return false
        });
    }
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports.default =
  executeGqlLambda((event, context) => {
      const headers = event.headers;
      const functionName = context.functionName;

      return {
        schema,
        headers,
        functionName,
        event,
        context,
        tracing: true,
        cacheControl: true,
      }
    }, {
      graphiql: true
    });
