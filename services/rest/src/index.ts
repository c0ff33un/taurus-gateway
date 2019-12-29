import { ApolloServer } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import { AuthAPI, GameAPI, GridAPI } from './apis'

const mocks = process.env.MOCKS !== undefined && process.env.MOCKS === 'true'
if (mocks) {
  console.log('Mocking APIs')
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: (): any => {
    return {
      authAPI: new AuthAPI(),
      gameAPI: new GameAPI(),
      gridAPI: new GridAPI(),
    }
  },
  context: ({ req }): any => {
    const token = req.headers.authorization || ''
    return { token }
    //const userId = req.headers.userid
  },
  plugins: [{
    requestDidStart() {
      return {
        willSendResponse(requestContext: any) {
          //console.log('[Rest-Gateway] ', requestContext)
          //console.log('[Rest-Gateway] ', requestContext.response.http.headers)
        }
      }
    }
  }]
})

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`🚀 Rest Gateway Server ready at ${url}`)
})

