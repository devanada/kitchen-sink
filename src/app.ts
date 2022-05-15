require("dotenv").config();
require("./config/database").connect();
import express from "express";
import cors from "cors";

import auth from "./middleware/auth";
import {
  userSignup,
  userLogin,
  userGet,
  userUpdate,
  userDelete,
} from "./controllers/user.controller";

const app = express();
var corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/register", userSignup);
app.post("/api/v1/login", userLogin);
app
  .route("/api/v1/profile")
  .get(auth, userGet)
  .put(auth, userUpdate)
  .delete(auth, userDelete);

export default app;
