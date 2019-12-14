const { ApolloServer, gql, AuthenticationError } = require('apollo-server')
const { buildFederatedSchema } = require('@apollo/federation')

const typeDefs = gql`
type User {
    id: Int
    handle: String
    email: String
    guest: Boolean
}

type Query {
  users: [User]
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
    id: String!
}

type Exit {
    x: Int!
    y: Int!
}

type Dimension {
    w: Int!
    h: Int!
}

type Grid {
    seed: Int!
    matrix: [Boolean]!
    exit: Exit!
    size: Dimension!
}

input GridInput {
    seed: Int
    w: Int
    h: Int
}

type Mutation {
  signup(user: UserInput): User
  login(user: UserLogin): LoggedUser
  confirmation(token: String): User
  guest: LoggedUser
  logout: LogoutMsg
  room: Room
  grid(settings: GridInput): Grid
}

`

const { RESTDataSource } = require('apollo-datasource-rest')

class AuthAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.AUTH_URL
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.headers.set('Content-Type', 'application/json')
    req.body = JSON.stringify(req.body)
  }

  async didReceiveResponse(res) {
    const jwt = res.headers.get('Authorization')
    let data = await res.json()
    if (jwt) {
      console.log(jwt)
      data.jwt = jwt.split(" ")[1]
    }
    return data
  }

  async newUser(user) { 
    const data = await this.post(`signup`, { user }) 
    console.log(data)
    return data
  }

  async confirmation(token) {
    const data = await this.get(`confirmation?confirmation_token=${token}`)
    console.log('data', data)
    return data
  }
  
  async login(user) { 
    const data = await this.post(`login`, { user }) 
    return { user: data, jwt: data.jwt }
  }

  async guest() {
    const data  = await this.post(`guests`)
    return { user: data, jwt: data.jwt }
  }

  async logout() {
    if (!this.context.token) {
      throw new AuthenticationError('must authenticate')
    }
    return this.delete(`logout`)
  }
}

class GameAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.GAME_URL
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.body = JSON.stringify(req.body)
  }

  async newRoom(user) { 
    const data = await this.post(`room`) 
    console.log(data)
    return data
  }
}

class GridAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.GRID_URL
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.body = JSON.stringify(req.body)
  }

  async generateGrid(settings) { 
    const data = await this.get(`grid?seed=${settings.seed}${settings.w?`&width=${settings.w}`:""}${settings.h?`&height=${settings.h}`:""}`) 
    console.log(data)
    const matrix = []
    data.matrix.forEach(row => {
      row.forEach(item => {
        matrix.push(item)
      })
    })
    return { seed: settings.seed, matrix, exit: { x: data.exit.first, y: data.exit.second }, size : { w: data.m, h: data.n } }
  }
}

const resolvers = {
  Query: {
    users: () => [], 
  },
  Mutation: {
    signup: async (_source, { user }, { dataSources }) => {
      return dataSources.authAPI.newUser(user)
    },
    confirmation: async (_source, { token }, {dataSources}) => {
      return dataSources.authAPI.confirmation(token)
    },
    login: async (_source, { user }, { dataSources }) => {
      return dataSources.authAPI.login(user)
    },
    logout: async (_source, _args, { dataSources }) => {
      return dataSources.authAPI.logout()
    },
    guest: async (_source, _args, { dataSources }) => {
      return dataSources.authAPI.guest()
    },
    room: async (_source, _args, { dataSources }) => {
      return dataSources.gameAPI.newRoom()
    },
    grid: async (_source, { settings }, { dataSources }) => {
      return dataSources.gridAPI.generateGrid(settings)
    },
  }
};

const server = new ApolloServer({ 
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => {
    return {
      authAPI: new AuthAPI(),
      gameAPI: new GameAPI(),
      gridAPI: new GridAPI(),
    }
  },
  context: ({ req }) => {
    const token = req.headers.authorization || ''
    return { token }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
}) 
