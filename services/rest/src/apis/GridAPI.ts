import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

class GridAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.GRID_URL
  }

  willSendRequest(req: RequestOptions) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.body = JSON.stringify(req.body)
  }

  async generateGrid(settings: any) {
    const data = await this.get(
      `grid?seed=${settings.seed}&width=${settings.cols}&height=${
        settings.rows
      }`
    )
    const matrix: any[] = []
    data.matrix.forEach((row: any) => {
      row.forEach((item: any) => {
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
