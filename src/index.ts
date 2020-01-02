import express from 'express'
import server from './server'
import cors from 'cors'
import proxy from 'http-proxy-middleware'
import cookieParser from 'cookie-parser'

const auth = (req: any): void => {
  const token = req.cookies.token
  console.log('token: ', token)
  if (token) {
    req.headers.authorization = token
  }
}

const app = express()
app.use(cookieParser())
// Authentication Middleware to-do
app.use(function(req, res, next) {
  console.log('auth middleware ', req.cookies)
  auth(req)
  
  console.log(req.headers)
  next()
})

// This was setting cors for OPTIONS but not for the actual response ¯\_(ツ)_/¯ thus not setting cookies
const DOMAIN = process.env.DOMAIN
const corsOptions = {
  origin: DOMAIN, // origin : true also doesnt set cookies ¯\_(ツ)_/¯
  credentials: true,
}

app.use(cors(corsOptions))

app.use('/ws/:id', proxy({ target: process.env.GAME_URL, ws: true, logLevel: 'debug' }))

server.applyMiddleware({
  app,
  cors: {
    credentials: true,
    origin: DOMAIN,
  },
  path: '/graphql' 
})

// HMR doesnt work well with this, use own CRA proxy config
/*if (process.env.PROXY_WEB) {
  const WEB_URL = process.env.WEB_URL
  if (WEB_URL) {
    const wsURL = 'ws://' + WEB_URL.substring(7,WEB_URL.length)
    console.log('Proxying wsURL', wsURL)
    app.use('/socksjs-node', proxy({ target: wsURL, ws: true }))
  }
  app.use('/', proxy({ target: WEB_URL }))
}*/

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Gateway Server Ready at ${PORT}`)
})
