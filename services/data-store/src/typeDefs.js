const { gql } = require('apollo-server')

const typeDefs = gql`
type Match {
  id: ID!
  players: [Player]
  winner: Player
  resolveTime: Int
}

extend type Player @key(fields: "id") {
  id: ID! @external
  matches: [Match]
}

type Mutation {
  newMatch(winner: ID, players: [ID], resolveTime: Int) : Match
}
`

module.exports = typeDefs
