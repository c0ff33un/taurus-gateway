const { gql } = require('apollo-server')

const typeDefs = gql`
type Match {
  id: ID!
  players: [Int]
  winner: Int
}

type Mutation {
  newMatch(winner: Int, players: [Int]) : Match
}

`

module.exports = typeDefs
