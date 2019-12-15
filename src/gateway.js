const { ApolloServer } = require("apollo-server");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

class AuthenticatedDataSource extends RemoteGraphQLDataSource {  
  willSendRequest({ request, context }) {
    if (context.token) {
      request.http.headers.set('Authorization', context.token);  
    }
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    { name: "rest", url:  process.env.REST_GATEWAY_URL },
    { name: "data-store", url: process.env.DATA_STORE_URL }
  ],
  buildService({ name, url }) {
    return new AuthenticatedDataSource({ url })
  }
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ 
    schema, 
    executor,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      return { token };
    }
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => server.stop())
  }


})();
