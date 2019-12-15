const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const gateway = new ApolloGateway({
  serviceList: [
    { name: "rest", url:  process.env.REST_GATEWAY_URL },
    { name: "data-store", url: process.env.DATA_STORE_URL }
  ]
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => server.stop())
  }


})();
