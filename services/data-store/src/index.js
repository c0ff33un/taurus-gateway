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

  async updateCounters(winner, players, time) {
    const data = await this.post('user', { "winner": winner, "users": players, "time": time})
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
    console.log('connected to database', url);
});

let retries = 0

function connectWithRetry() {
  if (retries === 3) {
    throw new Error("Database service unavailable")
  }
  const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'
  return mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) {
    if (err) {
      console.error('Failed to connect with db, retrying in 5 seconds', err)
      setTimeout(connectWithRetry, 5000)
      retries += 1
    }
  })
}

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready att ${url}`)
  connectWithRetry()
}) 
