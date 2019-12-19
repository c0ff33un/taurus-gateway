import { ApolloServer, AuthenticationError, gql } from 'apollo-server'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { getUserId } from './auth'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    const { token, userId, unAuthenticated } = context
    if (unAuthenticated) {
      return
    }
    request.http.headers.set('Authorization', token)
    request.http.headers.set('user-id', userId)
  }

  async didReceiveResponse(req) {
    const json = await req.json()
    console.log(json)
    return json
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
    return new AuthenticatedDataSource({ name, url })
  },
})

const unAuthenticated = ['login', 'signup', 'confirmAccount', 'resendAccountConfirmation', 'guest' ]

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  context: async ({ req }) => {
    const query = gql(req.body.query)
    const queryName = query.definitions[0].selectionSet.selections[0].name.value
    if (unAuthenticated.includes(queryName)) {
      return { unAuthenticated: true }
    }
    const token = req.headers.authorization || ''
    const json = await getUserId(token)
    const userId = json.data.me.id
    if  (!userId) throw new AuthenticationError('you must be logged in')
    return { token, userId }
  },
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}


