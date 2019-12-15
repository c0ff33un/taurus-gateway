const { gql } = require('apollo-server')

const typeDefs = gql`
type Match {
  id: ID!
  players: [String]
  winner: String
}

type Mutation {
  newMatch(winner: String, players: [String]) : Match
}

`

module.exports = typeDefs
