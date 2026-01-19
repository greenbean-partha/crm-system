const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");

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

startStandaloneServer(server, { listen: { port: 4000 } })
  .then(({ url }) => console.log(`🚀 Gateway ready at ${url}`))
  .catch(console.error);
