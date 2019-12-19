import { RESTDataSource } from 'apollo-datasource-rest'

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
    return this.post(`room`)
  }

  async setupRoom(room, settings) {
    return this.put(`room/${room}/setup`, settings)
  }

  async startRoom(room) {
    return this.put(`room/${room}/start`)
  }
}

export default GameAPI
