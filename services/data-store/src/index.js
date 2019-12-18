const { RESTDataSource } = require('apollo-datasource-rest');
const { ApolloServer } = require('apollo-server')
const { buildFederatedSchema } = require('@apollo/federation')
const mongoose = require('mongoose')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

class StatsAPI extends RESTDataSource{
  constructor(){
    super();
    this.baseURL = process.env.STATS_URL
  }

  async updateCounters(winner, players) {
    console.log('INSIDE DATASOURCE')
    const data = await this.post('user', { "winner": winner, "users": players })
    return data
  }
}

const server = new ApolloServer({ 
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => {
    return {
      statsAPI: new StatsAPI()
    }
  },
  context: ({ req }) => {
    const token = req.headers.authorization || ''
    return { token }
  }
})

mongoose.connection.once('open', (url) => {
    console.log('conneted to database', url);
});

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready at ${url}`)
  const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'
  mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
}) 

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}

