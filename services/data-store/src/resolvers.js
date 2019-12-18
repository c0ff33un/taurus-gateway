const { AuthenticationError } = require('apollo-server')
const MatchModel = require('./models/match')
const fetch = require('node-fetch')

const resolvers = {
  Query: {
    matches: () => [],
  },
  Mutation: {
    newMatch: async (_source, { winner, players, resolveTime }) => {
      console.log(`Create new Match: ${winner}, ${players}, ${resolveTime}`)
      const match = await MatchModel.create({ winner, players, resolveTime })
      const statsUrl = process.env.STATS_URL
      console.log(match, statsUrl)
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          users: players,
          time: resolveTime,
          winner: winner,
        }
      }
      console.log('options:', options)
      return fetch(`${statsUrl}/match`, options)
      .then(res => {
        console.log('res', res)
        return res.json()
      })
      .then(res => {
        console.log('res json:', res)
        return match
      })
      .catch(err => {
        console.log('error:', err) 
        return err
      })
    },
  }
}

module.exports = resolvers
