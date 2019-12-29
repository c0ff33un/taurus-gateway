import { AuthenticationError, UserInputError, ApolloError } from 'apollo-server'
import { RESTDataSource, RequestOptions, Response } from 'apollo-datasource-rest'
import { ValueOrPromise } from 'apollo-server-types'

class AuthAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.AUTH_URL
  }

  willSendRequest(req: RequestOptions): ValueOrPromise<void> {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
    }
    req.headers.set('Content-Type', 'application/json')
    req.body = JSON.stringify(req.body)
  }

  async didReceiveResponse<TResult = any>(res: Response): Promise<TResult> {
    const status = res.status
    const data = await res.json()
    console.log('[AuthAPI] response data: ', data)
    if (data.error !== undefined) {
      throw new ApolloError(data.error, "" + status)
    }
    console.log('[AuthAPI] response data: ', data)
    return data
  }

  async signup(email: string, handle: string, password: string) {
    return this.post(`signup`, { email, handle, password })
  }

  async login(email: string, password: string) {
    return this.post(`login`, { email, password })
  }

  async user() {
    console.log('getUser')
    return this.get(`user`)
  }

  async confirmation(token: string) {
    return this.get(`confirmation?confirmation_token=${token}`)
  }

  async resendConfirmation(email: string) {
    return this.post(`resend_confirmation/`, { user: { email } });
  }

  async guest() {
    return this.post(`guest`)
  }

  async logout() {
    if (!this.context.token) {
      throw new AuthenticationError('must authenticate')
    }
    return this.delete(`logout`)
  }
}

export default AuthAPI
