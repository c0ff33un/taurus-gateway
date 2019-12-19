import { ApolloServer } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import { AuthAPI, GameAPI, GridAPI } from './apis'

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => {
    return {
      authAPI: new AuthAPI(),
      gameAPI: new GameAPI(),
      gridAPI: new GridAPI(),
    }
  },
  context: ({ req }) => {
    const token = req.headers.authorization || ''
    return { token }
    //const userId = req.headers.userid
  },
})

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}

