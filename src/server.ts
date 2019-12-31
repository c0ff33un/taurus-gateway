import { ApolloServer, AuthenticationError } from 'apollo-server-express'
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
    console.log('[Gateway] cookies:', requestContext.req.cookies)
    return { token: requestContext.req.cookies.token }
  },
  plugins: [{
    requestDidStart() {
      return {
        didResolveOperation(requestContext): void  {
          const selection: any = requestContext.operation.selectionSet.selections[0]
          const queryName = selection.name.value
          if (unAuthenticated.includes(queryName)) {
            requestContext.context.unAuthenticated = false
            return
          }
          console.log("queryName: ", queryName)
          console.log("token: ", requestContext.context.token)
          if (!requestContext.context.token) {
            throw new AuthenticationError("Must be logged in")
          }
        },
        willSendResponse(requestContext: any): void {
          const context = requestContext.context
          if (context.login) {
            const { token } = context
            const expire = new Date(Date.now())
            expire.setDate(expire.getDate() + 7)
            console.log('Setting cookie: token=${token};' )

            requestContext.response.http.headers.set('Set-Cookie', `token=${token};`)
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
