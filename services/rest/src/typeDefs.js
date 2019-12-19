const { gql } = require('apollo-server')

const typeDefs = gql`
type Player @key(fields: "id") {
  id: ID!
  handle: String
  email: String
  guest: Boolean
}


input PlayerInput {
  handle: String
  email: String
  password: String
}

type LoggedPlayer {
  user: Player 
  jwt: String
}


type LogoutMsg {
  msg: String
}

input PlayerLogin {
  email: String!
  password: String!
}

type Room {
  id: String
}

type Exit {
  x: Int!
  y: Int!
}

type Dimension {
  rows: Int!
  cols: Int!
}

type Grid {
  seed: Int!
  matrix: [Boolean]!
  exit: Exit!
  size: Dimension!
}

input GridInput {
  seed: Int
  rows: Int
  cols: Int
}

type Query {
  me: Player
  message: String
  user: Player
  users: [Player]
  grid(settings: GridInput): Grid
}

type Mutation {
  signup(user: PlayerInput): Player
  confirmAccount(token: String): Player
  resendAccountConfirmation(email: String): Player
  login(user: PlayerLogin): LoggedPlayer
  guest: LoggedPlayer
  logout: LogoutMsg
  room: Room
  roomSetup(room: String, seed: Int, rows: Int, cols: Int): Room
  roomStart(room: String): Room
}
`

module.exports = typeDefs
