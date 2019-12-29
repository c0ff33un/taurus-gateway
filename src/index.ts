import express from 'express'
import cors from 'cors'
import server from './server'
const http = require('http')
const httpProxy = require('http-proxy')
const cookieParser = require('cookie-parser')


const app = express()
const proxy = httpProxy.createProxyServer({ target: process.env.GAME_URL, ws: true })
const httpServer = http.createServer(app)

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}
app.use(cors(corsOptions))

app.use(cookieParser())

// Authentication Middleware
app.use(function(req, _res, next) {
  //console.log('the cookies: @@@@@: \n', req.cookies)
  //req.set('Authorization', )
  //console.log('headers', req.headers)
  next()
})

// Proxy websockets
httpServer.on('upgrade', function(req: any, socket: any, head: any) {
  console.log("proxying upgrade request @@@@@@@@@2", req.url)
  proxy.ws(req, socket, head)
})

server.applyMiddleware({ app, path: '/graphql' })
httpServer.listen(4000, () => {
  console.log(`🚀 Gateway Server Ready`)
})
