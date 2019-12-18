const { AuthenticationError } = require('apollo-server')

const resolvers = {
  Query: {
    message: () => { return 'Hello World' },
    user : async (_soure, _args, { dataSources }) => {
      return dataSources.authAPI.user()
    },
    users: () => [], 
    grid: async (_source, { settings }, { dataSources }) => {
      return dataSources.gridAPI.generateGrid(settings)
    },
  },
  Mutation: {
    signup: async (_source, { user }, { dataSources }) => {
      return dataSources.authAPI.newUser(user)
    },
    confirmation: async (_source, { token }, { dataSources }) => {
      return dataSources.authAPI.confirmation(token)
    },
    resendConfirmation: async (_source, { email }, { dataSources }) => {
      return dataSources.authAPI.resendConfirmation(email)
    },
    login: async (_source, { user }, { dataSources }) => {
      return dataSources.authAPI.login(user)
    },
    logout: async (_source, _args, { dataSources }) => {
      return dataSources.authAPI.logout()
    },
    guest: async (_source, _args, { dataSources }) => {
      return dataSources.authAPI.guest()
    },
    room: async (_source, _args, { dataSources }) => {
      return dataSources.gameAPI.newRoom()
    },
    roomSetup: async (_source, { room, seed, rows, cols }, { dataSources }) => {
      const gridRes = await dataSources.gridAPI.generateGrid({seed,  cols, rows})
      const { matrix: grid, exit } = gridRes
      let begin = exit
      let currentDistance = 0
      for (let x = 0; x < rows; ++x) {
        for (let y = 0; y < cols; ++y) {
          let pos = x * cols + y
          if (grid[pos] === false) {
            let manhattanDistance = Math.abs(x - exit.x) + Math.abs(y - exit.y)
            if (manhattanDistance > currentDistance) {
              currentDistance = manhattanDistance
              begin = { x, y }
            }
          }
        }
      }
      const settings = { rows, cols, grid, exit, begin }
      return dataSources.gameAPI.setupRoom(room, settings)
    },
    roomStart: async (_source, { room }, { dataSources }) => {
      return dataSources.gameAPI.startRoom(room)
    },
  }
};

module.exports = resolvers
