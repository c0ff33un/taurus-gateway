const {
  ApolloServer,
  AuthenticationError,
  UserInputError,
} = require('apollo-server')
import { buildFederatedSchema } from '@apollo/federation'
import { RESTDataSource } from 'apollo-datasource-rest'
import typeDefs from './typeDefs'
import resolvers from './resolvers'

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

  async didReceiveResponse(res, req) {
    const jwt = res.headers.get('Authorization')
    const status = res.status
    let data = await res.json()
    if (jwt) {
      data.jwt = jwt.split(' ')[1]
    }
    data.status = status
    return data
  }

  async newUser(user) {
    return this.post(`signup`, { user })
  }

  async user() {
    return this.get(`user`)
  }

  async confirmation(token) {
    const data = await this.get(`confirmation?confirmation_token=${token}`)
    const status = data.status
    if (status === 422) {
      if (data.confirmation_token) {
        return new UserInputError('Token is Invalid')
      } else {
        return new Error('Internal Server Error')
      }
    }
    return data
  }

  async resendConfirmation(email) {
    const data = await this.get(`confirmation/new/`, { user: { email } })
    return data
  }

  async login(user) {
    const data = await this.post(`login`, { user })
    return { user: data, jwt: data.jwt }
  }

  async guest() {
    const data = await this.post(`guests`)
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

  async newRoom() {
    console.log('here')
    return this.post(`room`)
  }

  async setupRoom(room, settings) {
    return this.put(`room/${room}/setup`, settings)
  }

  async startRoom(room) {
    return this.put(`room/${room}/start`)
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
    const data = await this.get(
      `grid?seed=${settings.seed}&width=${settings.cols}&height=${
        settings.rows
      }`
    )
    const matrix = []
    data.matrix.forEach(row => {
      row.forEach(item => {
        matrix.push(item)
      })
    })
    return {
      seed: settings.seed,
      matrix,
      exit: { x: data.exit.first, y: data.exit.second },
      size: { cols: data.m, rows: data.n },
    }
  }
}

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
  },
})

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready at HMR works ${url}`)
})

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => { server.stop() })
}

