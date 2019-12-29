import { ApolloServer } from 'apollo-server-express'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  /*
  willSendRequest({ request, context }: { request: any; context: any }) {
    console.log('[Gateway] token:', context.token)
  }
  */

  async didReceiveResponse(res: any, _req: any, ctx: any) {
    const json = await res.json()
    if (json.data._service !== undefined) { // instropection queries
      return json
    }
    if (json.data.login  && json.data.login !== null) { // Token Granting Queries
      const token = json.data.login.token
      ctx.login = true
      ctx.token = token
      json.data.login.token = 'ok'
    }
    //console.log('[Gateway] response data:', json)
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
  buildService({ url }) {
    return new AuthenticatedDataSource({ url })
  },
})

const unAuthenticated = ['login', 'signup', 'confirmAccount', 'resendAccountConfirmation', 'guest' ]
const server = new ApolloServer({
  gateway,
  subscriptions: false,
  context: (requestContext: any) => {
    //console.log('[Gateway] cookies:', requestContext.req.cookies)
    return { token: requestContext.req.cookies.token }
  },
  plugins: [{
    requestDidStart() {
      return {
        didResolveOperation: async (requestContext) => {
          const selection: any = requestContext.operation.selectionSet.selections[0]
          const queryName = selection.name.value
          if (unAuthenticated.includes(queryName)) {
            requestContext.context.unAuthenticated = false
          }
        },
        willSendResponse(requestContext: any) {
          const context = requestContext.context
          if (context.login) {
            const { token } = context
            requestContext.response.http.headers.set('set-cookie', `token=${token}; SameSite=Strict; HttpOnly`)
          }
        }
      }
    }
  }],
  /*
  formatError(err) {
    if (err) {
      console.log(err)
    }
    return err
  }
  */
})

export default server
