const { AuthenticationError } = require('apollo-server')
const MatchModel = require('./models/match')

const resolvers = {
  Query: {
    matches: () => [],
  },
  Mutation: {  
    newMatch: async (_source, { winner, players }, { dataSources }) => {
      dataSources.statsAPI.updateCounters(winner, players)
      return MatchModel.create({ winner, players })
    },
  }
}

module.exports = resolvers
