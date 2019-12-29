import express from 'express'
import cors from 'cors'
import server from './server'
const cookieParser = require('cookie-parser')

const app = express()
// This was setting cors for OPTIONS but not for the actual response ¯\_(ツ)_/¯
/*
const corsOptions = {
  origin: true,
  credentials: true,
}
app.use(cors(corsOptions))
  */
app.use(cookieParser())
server.applyMiddleware({
  app,
  cors: {
    credentials: true,
    origin: true,
  },
  path: '/graphql' 
})
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Gateway Server Ready`)
})
