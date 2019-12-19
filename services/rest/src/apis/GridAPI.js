import { RESTDataSource } from 'apollo-datasource-rest'

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

export default GridAPI
