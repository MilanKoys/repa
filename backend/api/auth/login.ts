import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";

import { getDatabase } from "../../database.js";
import { createSession, removeSession } from "../../session.js";
import { User } from "../../users.js";

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

router.get("/logout", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return errorStatus(403);

  res.json(await removeSession({ token }));

  function errorStatus(status: number) {
    res.sendStatus(status);
    return;
  }
});

router.post("/login", async (req, res) => {
  const database = getDatabase("repa");
  if (!database) {
    res.sendStatus(500);
    return;
  }
  const users = database.collection<User>("users");
  const body = req.body;
  const bodyValid = loginSchema.validate(body);
  if (bodyValid.error) {
    res.json(bodyValid.error);
    return;
  }

  const user = await users.findOne({ email: body.email.toLowerCase() });
  if (!user) {
    res.json({ error: "Unauthorized" });
    return;
  }

  const compare = bcrypt.compareSync(body.password, user.password);
  if (!compare) {
    res.json({ error: "Unauthorized" });
    return;
  }

  const session = await createSession(user);
  if (!session) {
    res.sendStatus(500);
    return;
  }

  res.json(session);
});

export default router;
