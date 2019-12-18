const { gql } = require('apollo-server')

const typeDefs = gql`
type Match {
  id: ID!
  players: [String]
  winner: String
  resolveTime: Float
}

type Mutation {
  newMatch(winner: String, players: [String], resolveTime: Int) : Match
}

`

module.exports = typeDefs
