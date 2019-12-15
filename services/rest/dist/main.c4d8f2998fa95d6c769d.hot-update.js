exports.id = "main";
exports.modules = {

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  ApolloServer,
  AuthenticationError,
  UserInputError
} = __webpack_require__(/*! apollo-server */ "apollo-server");
const { buildFederatedSchema } = __webpack_require__(/*! @apollo/federation */ "@apollo/federation");
const { RESTDataSource } = __webpack_require__(/*! apollo-datasource-rest */ "apollo-datasource-rest");
const typeDefs = __webpack_require__(/*! ./typeDefs */ "./src/typeDefs.js");
const resolvers = __webpack_require__(/*! ./resolvers */ "./src/resolvers.js");

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


if (true) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}


/***/ })

};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxHQUFHLG1CQUFPLENBQUMsb0NBQWU7QUFDM0IsT0FBTyx1QkFBdUIsR0FBRyxtQkFBTyxDQUFDLDhDQUFvQjtBQUM3RCxPQUFPLGlCQUFpQixHQUFHLG1CQUFPLENBQUMsc0RBQXdCO0FBQzNELGlCQUFpQixtQkFBTyxDQUFDLHFDQUFZO0FBQ3JDLGtCQUFrQixtQkFBTyxDQUFDLHVDQUFhOztBQUV2QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEMsT0FBTztBQUNuRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtRUFBbUUsTUFBTTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzREFBc0QsUUFBUSxRQUFRLEVBQUU7QUFDeEU7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkNBQTJDLE9BQU87QUFDbEQsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOENBQThDLEtBQUs7QUFDbkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDLEtBQUs7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CLGNBQWMsU0FBUyxjQUFjO0FBQ3hEO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGFBQWEsMENBQTBDO0FBQ3ZELGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsc0JBQXNCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxhQUFhLE1BQU07QUFDbkI7QUFDQSxZQUFZO0FBQ1o7QUFDQSxDQUFDOzs7QUFHRDtBQUNBLCtDQUErQyxNQUFNO0FBQ3JELGlDQUFpQyxJQUFJO0FBQ3JDLENBQUM7OztBQUdELElBQUksSUFBVTtBQUNkO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmM0ZDhmMjk5OGZhOTVkNmM3NjlkLmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7XG4gIEFwb2xsb1NlcnZlcixcbiAgQXV0aGVudGljYXRpb25FcnJvcixcbiAgVXNlcklucHV0RXJyb3Jcbn0gPSByZXF1aXJlKFwiYXBvbGxvLXNlcnZlclwiKTtcbmNvbnN0IHsgYnVpbGRGZWRlcmF0ZWRTY2hlbWEgfSA9IHJlcXVpcmUoXCJAYXBvbGxvL2ZlZGVyYXRpb25cIik7XG5jb25zdCB7IFJFU1REYXRhU291cmNlIH0gPSByZXF1aXJlKFwiYXBvbGxvLWRhdGFzb3VyY2UtcmVzdFwiKTtcbmNvbnN0IHR5cGVEZWZzID0gcmVxdWlyZShcIi4vdHlwZURlZnNcIik7XG5jb25zdCByZXNvbHZlcnMgPSByZXF1aXJlKFwiLi9yZXNvbHZlcnNcIik7XG5cbmNsYXNzIEF1dGhBUEkgZXh0ZW5kcyBSRVNURGF0YVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5iYXNlVVJMID0gcHJvY2Vzcy5lbnYuQVVUSF9VUkw7XG4gIH1cblxuICB3aWxsU2VuZFJlcXVlc3QocmVxKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC50b2tlbikge1xuICAgICAgcmVxLmhlYWRlcnMuc2V0KFwiQXV0aG9yaXphdGlvblwiLCB0aGlzLmNvbnRleHQudG9rZW4pO1xuICAgIH1cbiAgICByZXEuaGVhZGVycy5zZXQoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHJlcS5ib2R5ID0gSlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpO1xuICB9XG5cbiAgYXN5bmMgZGlkUmVjZWl2ZVJlc3BvbnNlKHJlcywgcmVxKSB7XG4gICAgY29uc3Qgand0ID0gcmVzLmhlYWRlcnMuZ2V0KFwiQXV0aG9yaXphdGlvblwiKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXMuc3RhdHVzO1xuICAgIGxldCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICBpZiAoand0KSB7XG4gICAgICBjb25zb2xlLmxvZyhqd3QpO1xuICAgICAgZGF0YS5qd3QgPSBqd3Quc3BsaXQoXCIgXCIpWzFdO1xuICAgIH1cbiAgICBkYXRhLnN0YXR1cyA9IHN0YXR1cztcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGFzeW5jIG5ld1VzZXIodXNlcikge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLnBvc3QoYHNpZ251cGAsIHsgdXNlciB9KTtcbiAgICBjb25zb2xlLmxvZygndGhlIGRhdGEnLCBkYXRhKVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgYXN5bmMgY29uZmlybWF0aW9uKHRva2VuKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0KGBjb25maXJtYXRpb24/Y29uZmlybWF0aW9uX3Rva2VuPSR7dG9rZW59YCk7XG4gICAgY29uc3Qgc3RhdHVzID0gZGF0YS5zdGF0dXM7XG4gICAgaWYgKHN0YXR1cyA9PT0gNDIyKSB7XG4gICAgICBpZiAoZGF0YS5jb25maXJtYXRpb25fdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VySW5wdXRFcnJvcihcIlRva2VuIGlzIEludmFsaWRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGFzeW5jIHJlc2VuZENvbmZpcm1hdGlvbihlbWFpbCkge1xuICAgIGNvbnNvbGUubG9nKGVtYWlsKTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXQoYGNvbmZpcm1hdGlvbi9uZXcvYCwgeyB1c2VyOiB7IGVtYWlsIH0gfSk7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBhc3luYyBsb2dpbih1c2VyKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucG9zdChgbG9naW5gLCB7IHVzZXIgfSk7XG4gICAgcmV0dXJuIHsgdXNlcjogZGF0YSwgand0OiBkYXRhLmp3dCB9O1xuICB9XG5cbiAgYXN5bmMgZ3Vlc3QoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucG9zdChgZ3Vlc3RzYCk7XG4gICAgY29uc29sZS5sb2coJ3RoZSBkYXRhIGNoYW5nZWQnLCBkYXRhKVxuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UnKVxuICAgIHJldHVybiB7IHVzZXI6IGRhdGEsIGp3dDogZGF0YS5qd3QgfTtcbiAgfVxuXG4gIGFzeW5jIGxvZ291dCgpIHtcbiAgICBpZiAoIXRoaXMuY29udGV4dC50b2tlbikge1xuICAgICAgdGhyb3cgbmV3IEF1dGhlbnRpY2F0aW9uRXJyb3IoXCJtdXN0IGF1dGhlbnRpY2F0ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGVsZXRlKGBsb2dvdXRgKTtcbiAgfVxufVxuXG5jbGFzcyBHYW1lQVBJIGV4dGVuZHMgUkVTVERhdGFTb3VyY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYmFzZVVSTCA9IHByb2Nlc3MuZW52LkdBTUVfVVJMO1xuICB9XG5cbiAgd2lsbFNlbmRSZXF1ZXN0KHJlcSkge1xuICAgIGlmICh0aGlzLmNvbnRleHQudG9rZW4pIHtcbiAgICAgIHJlcS5oZWFkZXJzLnNldChcIkF1dGhvcml6YXRpb25cIiwgdGhpcy5jb250ZXh0LnRva2VuKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJ0aGUgcmVxXCIsIHJlcSk7XG4gICAgcmVxLmJvZHkgPSBKU09OLnN0cmluZ2lmeShyZXEuYm9keSk7XG4gIH1cblxuICBhc3luYyBuZXdSb29tKHVzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5wb3N0KGByb29tYCk7XG4gIH1cblxuICBhc3luYyBzZXR1cFJvb20ocm9vbSwgc2V0dGluZ3MpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5wdXQoYHJvb20vc2V0dXAvJHtyb29tfWAsIHNldHRpbmdzKTtcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0Um9vbShyb29tKSB7XG4gICAgcmV0dXJuIHRoaXMucHV0KGByb29tL3N0YXJ0LyR7cm9vbX1gKTtcbiAgfVxufVxuXG5jbGFzcyBHcmlkQVBJIGV4dGVuZHMgUkVTVERhdGFTb3VyY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYmFzZVVSTCA9IHByb2Nlc3MuZW52LkdSSURfVVJMO1xuICB9XG5cbiAgd2lsbFNlbmRSZXF1ZXN0KHJlcSkge1xuICAgIGlmICh0aGlzLmNvbnRleHQudG9rZW4pIHtcbiAgICAgIHJlcS5oZWFkZXJzLnNldChcIkF1dGhvcml6YXRpb25cIiwgdGhpcy5jb250ZXh0LnRva2VuKTtcbiAgICB9XG4gICAgcmVxLmJvZHkgPSBKU09OLnN0cmluZ2lmeShyZXEuYm9keSk7XG4gIH1cblxuICBhc3luYyBnZW5lcmF0ZUdyaWQoc2V0dGluZ3MpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXQoXG4gICAgICBgZ3JpZD9zZWVkPSR7c2V0dGluZ3Muc2VlZH0md2lkdGg9JHtzZXR0aW5ncy5jb2xzfSZoZWlnaHQ9JHtcbiAgICAgICAgc2V0dGluZ3Mucm93c1xuICAgICAgfWBcbiAgICApO1xuICAgIGNvbnN0IG1hdHJpeCA9IFtdO1xuICAgIGRhdGEubWF0cml4LmZvckVhY2gocm93ID0+IHtcbiAgICAgIHJvdy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBtYXRyaXgucHVzaChpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBzZWVkOiBzZXR0aW5ncy5zZWVkLFxuICAgICAgbWF0cml4LFxuICAgICAgZXhpdDogeyB4OiBkYXRhLmV4aXQuZmlyc3QsIHk6IGRhdGEuZXhpdC5zZWNvbmQgfSxcbiAgICAgIHNpemU6IHsgY29sczogZGF0YS5tLCByb3dzOiBkYXRhLm4gfVxuICAgIH07XG4gIH1cbn1cblxuY29uc3Qgc2VydmVyID0gbmV3IEFwb2xsb1NlcnZlcih7XG4gIHNjaGVtYTogYnVpbGRGZWRlcmF0ZWRTY2hlbWEoW3sgdHlwZURlZnMsIHJlc29sdmVycyB9XSksXG4gIGRhdGFTb3VyY2VzOiAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF1dGhBUEk6IG5ldyBBdXRoQVBJKCksXG4gICAgICBnYW1lQVBJOiBuZXcgR2FtZUFQSSgpLFxuICAgICAgZ3JpZEFQSTogbmV3IEdyaWRBUEkoKVxuICAgIH07XG4gIH0sXG4gIGNvbnRleHQ6ICh7IHJlcSB9KSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uIHx8IFwiXCI7XG4gICAgcmV0dXJuIHsgdG9rZW4gfTtcbiAgfVxufSk7XG5cblxuY29uc29sZS5sb2cocHJvY2Vzcy5lbnYuUE9SVCk7XG5zZXJ2ZXIubGlzdGVuKHByb2Nlc3MuZW52LlBPUlQgfHwgNDAwMCkudGhlbigoeyB1cmwgfSkgPT4ge1xuICBjb25zb2xlLmxvZyhgU2VydmVyIHJlYWR5IGF0ICR7dXJsfWApO1xufSk7XG5cblxuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoKCkgPT4gc2VydmVyLnN0b3AoKSlcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=