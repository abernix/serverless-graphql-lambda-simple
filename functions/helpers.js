const { resolve: urlResolve } = require("url");
const {
  graphqlLambda,
  graphiqlLambda,
} = require("apollo-server-lambda");

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

function executeGqlLambda(method, options = {}) {
  return function (...args) {
    // So we can use them locally, but still pass `args` directly.
    const [event] = args;

    if (options.graphiql &&
      event.path &&
      event.path.startsWith("/graphiql")) {

      const endpointURL =
        urlResolve(process.env.ENGINE_PROXY_URL, "/graphql");

      return graphiqlLambda({ endpointURL })(...args);
    }

    const query = queryFromEvent(event);

    // This forces the otherwise Lambda shaped query into what Apollo Server
    // expects (it refuses to process it otherwise!)
    event.httpMethod = 'POST';
    event.body = JSON.stringify({ query });

    return graphqlLambda(method)(...args);
  }
}

module.exports = {
  executeGqlLambda,
}