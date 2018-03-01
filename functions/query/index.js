const { resolve: urlResolve } = require("url");
const rp = require("request-promise-native");

const {
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLDirective,
} = require('graphql')

const { executeGqlLambda } = require("../helpers.js");

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      greeting: {
        args: {
          firstName: {
            name: 'firstName',
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        type: GraphQLString,
        resolve: (parent, args, haveNotLookedUpWhatThisIsTODO, { cacheControl }) => {
          cacheControl.setCacheHint({maxAge: 60});
          return `Hello, ${args.firstName}.`;
        },
      },

      // This query simply shows that the Lambda is aware of its Engine leader,
      // and could, in theory, communicate with it.
      engineHealth: {
        type: GraphQLBoolean,
        resolve: (parent, args, haveNotLookedUpWhatThisIsTODO, { cacheControl }) => {
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
        },
      }
    }
  }),
})

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
