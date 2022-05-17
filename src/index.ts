import http from "http";
import App from "./app";
const server = http.createServer(App);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
  console.log(`Server ready to serve and running on port ${port}`);
});
