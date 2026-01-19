const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");
const fetch = require("node-fetch");

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "identity", url: "http://identity-service:8000/graphql/" },
      { name: "crm", url: "http://crm-service:8000/graphql/" },
    ],
    pollIntervalInMs: 10000, // keep retrying forever
  }),
});

const server = new ApolloServer({
  gateway,
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    return {
        headers: {
        "x-company-id": req.headers["x-company-id"],
        },
    };
  },
});
