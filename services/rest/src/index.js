const {
  ApolloServer,
  AuthenticationError,
  UserInputError
} = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { RESTDataSource } = require("apollo-datasource-rest");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

class AuthAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.AUTH_URL;
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set("Authorization", this.context.token);
    }
    req.headers.set("Content-Type", "application/json");
    req.body = JSON.stringify(req.body);
  }

  async didReceiveResponse(res, req) {
    const jwt = res.headers.get("Authorization");
    const status = res.status;
    let data = await res.json();
    if (jwt) {
      console.log(jwt);
      data.jwt = jwt.split(" ")[1];
    }
    data.status = status;
    return data;
  }

  async newUser(user) {
    const data = await this.post(`signup`, { user });
    console.log('the data', data)
    return data;
  }

  async confirmation(token) {
    const data = await this.get(`confirmation?confirmation_token=${token}`);
    const status = data.status;
    if (status === 422) {
      if (data.confirmation_token) {
        return new UserInputError("Token is Invalid");
      } else {
        return new Error("Internal Server Error");
      }
    }
    return data;
  }

  async resendConfirmation(email) {
    console.log(email);
    const data = await this.get(`confirmation/new/`, { user: { email } });
    console.log(data);
    return data;
  }

  async login(user) {
    const data = await this.post(`login`, { user });
    return { user: data, jwt: data.jwt };
  }

  async guest() {
    const data = await this.post(`guests`);
    console.log('the data changed', data)
    console.log('please')
    return { user: data, jwt: data.jwt };
  }

  async logout() {
    if (!this.context.token) {
      throw new AuthenticationError("must authenticate");
    }
    return this.delete(`logout`);
  }
}

class GameAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.GAME_URL;
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set("Authorization", this.context.token);
    }
    console.log("the req", req);
    req.body = JSON.stringify(req.body);
  }

  async newRoom(user) {
    return this.post(`room`);
  }

  async setupRoom(room, settings) {
    const data = await this.put(`room/setup/${room}`, settings);
    console.log(data);
    return data;
  }

  async startRoom(room) {
    return this.put(`room/start/${room}`);
  }
}

class GridAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.GRID_URL;
  }

  willSendRequest(req) {
    if (this.context.token) {
      req.headers.set("Authorization", this.context.token);
    }
    req.body = JSON.stringify(req.body);
  }

  async generateGrid(settings) {
    const data = await this.get(
      `grid?seed=${settings.seed}&width=${settings.cols}&height=${
        settings.rows
      }`
    );
    const matrix = [];
    data.matrix.forEach(row => {
      row.forEach(item => {
        matrix.push(item);
      });
    });
    return {
      seed: settings.seed,
      matrix,
      exit: { x: data.exit.first, y: data.exit.second },
      size: { cols: data.m, rows: data.n }
    };
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => {
    return {
      authAPI: new AuthAPI(),
      gameAPI: new GameAPI(),
      gridAPI: new GridAPI()
    };
  },
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    return { token };
  }
});


console.log(process.env.PORT);
server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});


if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}
