import express from 'express'
import cors from 'cors'
import server from './server'
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}
app.use(cors(corsOptions))
server.applyMiddleware({ app, path: '/graphql' })
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Gateway Server Ready`)
})
