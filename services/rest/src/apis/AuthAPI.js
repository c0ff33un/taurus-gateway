import { AuthenticationError, UserInputError } from 'apollo-server'
import { RESTDataSource } from 'apollo-datasource-rest'

class AuthAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.AUTH_URL
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set('Authorization', this.context.token)
      console.log(this.context.token)
    }
    req.headers.set('Content-Type', 'application/json')
    req.body = JSON.stringify(req.body)
  }

  async didReceiveResponse(res) {
    const jwt = res.headers.get('Authorization')
    const status = res.status
    let data = await res.json()
    if (jwt) {
      data.jwt = jwt.split(' ')[1]
    }
    data.status = status
    console.log(data)
    return data
  }

  async newUser(user) {
    return this.post(`signup`, { user })
  }

  async user() {
    console.log('getUser')
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
    const data = await this.post(`resend_confirmation/`, { user: { email } });
    return data;
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

export default AuthAPI
