import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

class GameAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.GAME_URL
  }

  willSendRequest(req: RequestOptions) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.body = JSON.stringify(req.body)
  }

  async newRoom() {
    return this.post(`room`)
  }

  async setupRoom(room: string, settings: any) {
    return this.put(`room/${room}/setup`, settings)
  }

  async startRoom(room: string) {
    return this.put(`room/${room}/start`)
  }
}

export default GameAPI
