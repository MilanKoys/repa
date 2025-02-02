import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { initDatabase } from "./database.js";

import auth from "./api/auth/router.js";

const port = 3000;
const databaseConnectionString = "mongodb://127.0.0.1:27017";
const mongodb = initDatabase(databaseConnectionString);

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));

app.use("/auth", auth);

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
mongodb
  .connect()
  .then(() =>
    console.log(`Databse connected with string ${databaseConnectionString}`)
  );
