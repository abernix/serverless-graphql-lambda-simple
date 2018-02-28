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
      engineHealth: {
        type: GraphQLBoolean,
        resolve: (parent, args, haveNotLookedUpWhatThisIsTODO, { cacheControl }) => {
          cacheControl.setCacheHint({maxAge: 60});
          return false;
        },
      },
      debug: {
        type: GraphQLString,
        resolve: () => {
          return JSON.stringify(process.env);
        },
      },
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
    });
