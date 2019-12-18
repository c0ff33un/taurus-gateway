const { ApolloServer } = require('apollo-server')
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway')

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    //const { token, userId } = context
    //request.http.headers.set('user-id', context.token)
    const { token } = context
    //Compatibility
    request.http.headers.set('Authorization', context.token)
  }
}

const REST_GATEWAY_URL = process.env.REST_GATEWAY_URL
const DATA_STORE_URL = process.env.DATA_STORE_URL

console.log(`Rest Resolver URL: ${REST_GATEWAY_URL}`)
console.log(`Data Store URL; ${DATA_STORE_URL}`)

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'rest', url: REST_GATEWAY_URL },
    { name: 'data-store', url: DATA_STORE_URL },
  ],
  buildService({ name, url }) {
    return new AuthenticatedDataSource({ url })
  },
})

function getUserId(token) {
  const authUrl = process.env.AUTH_MS_URL
  return fetch(`${authUrl}/user`, {
    headers: {
      'Authorization': token
    }
  }).then(res => res.json())
    .then(res => {
      console.log(res)
      return res.user.id
    })
}

(async () => {
  const { schema, executor } = await gateway.load()

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => {
      const token = req.headers.authorization || ''

      //const userId = getUserId(token)
      //return { token, userId }
      return { token }
    },
  })

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })

})()


if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}
