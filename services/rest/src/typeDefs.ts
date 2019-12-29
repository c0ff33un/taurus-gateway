import { gql } from 'apollo-server'

const typeDefs = gql`
type Player @key(fields: "id") {
  id: ID!
  handle: String
  email: String
}

input PlayerInput {
  handle: String
  email: String
  password: String
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

type Login {
  token: String
  player: Player
}

type Query {
  me: Player
  message: String
  user: Player
  users: [Player]
  grid(settings: GridInput): Grid
}

type Mutation {
  signup(email: String, handle: String, password: String): Player
  login(email: String, password: String): Login
  confirmAccount(token: String): Player
  resendAccountConfirmation(email: String): Player
  guest: Login
  logout: LogoutMsg
  room: Room
  roomSetup(room: String, seed: Int, rows: Int, cols: Int): Room
  roomStart(room: String): Room
}
`

export default typeDefs
