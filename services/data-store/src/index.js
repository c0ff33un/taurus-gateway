const { ApolloServer } = require('apollo-server')
const { buildFederatedSchema } = require('@apollo/federation')
const mongoose = require('mongoose')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({ 
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
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

