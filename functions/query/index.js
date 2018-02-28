const {
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLDirective,
} = require('graphql')

const getGreeting = firstName => `Hello, ${firstName}.`;

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
          return getGreeting(args.firstName);
        },
      },
      engineHealth: {
        type: GraphQLString,
        resolve: (parent, args, haveNotLookedUpWhatThisIsTODO, { cacheControl }) => {
          cacheControl.setCacheHint({maxAge: 60});
          return false;
        },
      }
    }
  }),
})

function queryFromEvent(event) {
  if (!event) {
    throw new Error("There was no event, so we don't know what to do.");
  }

  if (typeof event.body === "string") {
    try {
      // console.log("Ok, it's a string, turning it into JSON.");
      const potentialBody = JSON.parse(event.body);
      if (potentialBody.query) {
        return potentialBody.query;
      }
      return potentialBody;
    } catch (err) {
      // console.log("The event.body was not well-formed JSON.");
    }
  }

  if (typeof event.body === "object") {
    // console.log("looks like an object");
    return event.body;
  }

  throw new Error("None of event types contained a query?");
}

function wrappedMethod(method) {
  return function (event, context, callback) {
    console.log("EVENT", typeof event, event);
    console.log("CONTEXT", context);
    const query = queryFromEvent(event);
    console.log("QUERY", query);

    event.httpMethod = 'POST';
    event.body = JSON.stringify({query});

    return require('apollo-server-lambda').graphqlLambda(method)(event, context, callback);
  }
}

module.exports.default =
  wrappedMethod((event, context) => {
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
