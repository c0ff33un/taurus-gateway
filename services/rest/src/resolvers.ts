type context = { dataSources: any }
type setupSettings = { room: string, rows: number, cols: number, seed: number }

const resolvers: any = {
  Player: {
    __resolveReference(reference: any, _arg: any, { dataSources }: context): Promise<any> {
      return dataSources.authAPI.fetchUserById(reference.id)
    }
  },
  Query: {
    me: async (_source: any, _args: any, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.user()
    },
    grid: async (_source: any, { settings }: any, { dataSources }: context): Promise<any> => {
      return dataSources.gridAPI.generateGrid(settings)
    },
  },
  Mutation: {
    signup: async (_source: any, { email, handle, password }: { email: string; handle: string; password: string }, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.signup(email, handle, password)
    },
    login: async (_source: any, { email, password }: { email: string; password: string }, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.login(email, password)
    },
    confirmAccount: async (_source: any, { token }: { token: string }, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.confirmation(token)
    },
    resendAccountConfirmation: async (_source: any, { email }: { email: string }, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.resendConfirmation(email)
    },
    logout: async (_source: any, _args: any, { dataSources }: context): Promise<any> => {
      return dataSources.authAPI.logout()
    },
    guest: async (_source: any, _args: any, { dataSources }: context): Promise<any>  => {
      return dataSources.authAPI.guest()
    },
    room: async (_source: any, _args: any, { dataSources }: context): Promise<any>  => {
      return dataSources.gameAPI.newRoom()
    },
    roomSetup: async (_source: any, { room, seed, rows, cols }: setupSettings, { dataSources }: context): Promise<any>  => {
      const gridRes = await dataSources.gridAPI.generateGrid({seed,  cols, rows})
      const { matrix: grid, exit } = gridRes
      let begin = exit
      let currentDistance = 0
      for (let x = 0; x < rows; ++x) {
        for (let y = 0; y < cols; ++y) {
          const pos = x * cols + y
          if (grid[pos] === false) {
            const manhattanDistance = Math.abs(x - exit.x) + Math.abs(y - exit.y)
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
    roomStart: async (_source: any, { room }: { room: string }, { dataSources }: context): Promise<any>  => {
      return dataSources.gameAPI.startRoom(room)
    },
  }
};

export default resolvers
