const { gql } = require('apollo-server')

const typeDefs = gql`
type User @key(fields: "id") {
  id: ID!
  handle: String
  email: String
  guest: Boolean
}


input UserInput {
  handle: String
  email: String
  password: String
}

type LoggedUser {
  user: User
  jwt: String
}


type LogoutMsg {
  msg: String
}

input UserLogin {
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
  message: String
  user: User
  users: [User]
  grid(settings: GridInput): Grid
}

type Mutation {
  signup(user: UserInput): User
  login(user: UserLogin): LoggedUser
  confirmation(token: String): User
  resendConfirmation(email: String): User
  guest: LoggedUser
  logout: LogoutMsg
  room: Room
  roomSetup(room: String, seed: Int, rows: Int, cols: Int): Room
  roomStart(room: String): Room
}
`

module.exports = typeDefs
