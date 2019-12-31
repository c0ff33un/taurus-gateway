import express from 'express'
import server from './server'
const cors = require('cors')
const proxy = require('http-proxy-middleware')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())

// This was setting cors for OPTIONS but not for the actual response ¯\_(ツ)_/¯ thus not setting cookies
const corsOptions = {
  origin: 'http://localhost:3000', // origin : true also doesnt set cookies ¯\_(ツ)_/¯
  credentials: true,
}
app.use(cors(corsOptions))

// Authentication Middleware to-do
app.use(function(req, _res, next) {
  console.log('the cookies: @@@@@: \n', req.cookies)
  
  //req.set('Authorization', )
  //console.log('headers', req.headers)
  console.log('authentication middleware')
  next()
})

app.use('/ws/:id',
  function(req, res, next) {
    console.log('forwarding websocket request', req.originalUrl)
    console.log('to: ', process.env.GAME_URL)
    next()
  },
  proxy({ target: process.env.GAME_URL, ws: true }) // need ws:// 
)

server.applyMiddleware({
  app,
  cors: {
    credentials: true,
    origin: 'http://localhost:3000',
  },
  path: '/graphql' 
})

app.listen(4000, () => {
  console.log(`🚀 Gateway Server Ready`)
})
