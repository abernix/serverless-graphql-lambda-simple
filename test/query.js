"use strict";

const mochaPlugin = require("serverless-mocha-plugin");
const expect = mochaPlugin.chai.expect;
const wrapped = mochaPlugin.getWrapper(
  "query", "/functions/query/index.js",
  "default");

const queryAsLambdaEvent = (query) => ({
  body: JSON.stringify({ query })
});

describe("query", function () {
  describe("errors", function () {
    it("actually happen", () => {
      // An empty query should raise an error, let's just make sure that
      // our "errors" object is working properly.
      return wrapped.run(queryAsLambdaEvent(`{}`))
        .then(response => {
          expect(response.statusCode.toString().substring(0, 1))
            .not.to.equal("2");
          expect(JSON.parse(response.body))
            .to.have.property("errors");
        });
    })
  });

  describe("graphiql", () => {
    it("returns the graphiql tool", () => {
      const graphiqlRequest = {
        path: "/graphiql"
      };

      return wrapped.run(graphiqlRequest).then((response) => {
        expect(response).to.not.be.empty;
        expect(response.statusCode).to.equal(200);
        expect(response.headers).to.include({ "Content-Type": "text/html"});
        expect(response.body).to.not.be.empty;
      });
    });
  });

  describe("greeting", function () {
    const runWithName = (name = "Anyone") =>
      wrapped.run(queryAsLambdaEvent(`{ greeting(firstName: "${name}") }`));

    it("includes graphql-tracing data", () => {
      return runWithName().then(response => {
        expect(JSON.parse(response.body))
          .to.have.property("extensions");
      })
    });

    it("returns data, not errors", () => {
      return runWithName().then(response => {
        expect(response).to.have.property("body");
        const body = JSON.parse(response.body);
        expect(body).to.have.property("data");
        expect(body).not.to.have.property("errors");
      });
    });

    it("switching the parameters, changes the result", () => {
      return runWithName("Jill")
        .then(({ body }) => {
          expect(JSON.parse(body).data.greeting)
            .to.equal("Hello, Jill.");
        })
        .then(() => runWithName("Joshua"))
        .then(({ body }) => {
          expect(JSON.parse(body).data.greeting)
            .to.equal("Hello, Joshua.");
        });
    });
  });

  describe("engineHealth", function () {
    it("returns a boolean", () => {
      return wrapped
        .run(queryAsLambdaEvent(`{ engineHealth }`))
        .then(({ body }) => {
          expect(JSON.parse(body).data.engineHealth).to.be.a("boolean");
        });
    });
  });
});
