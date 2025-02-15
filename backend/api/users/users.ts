import express from "express";

import { getDatabase } from "../../database.js";
import { getSession } from "../../session.js";
import {
  getUser,
  getUsers,
  Roles,
  updateUser,
  User,
  UserLike,
} from "../../users.js";
import { hasRoles } from "../../auth.js";
import Joi from "joi";

const router = express.Router();

const updateUserSchema = Joi.object<User>({
  id: Joi.string().required(),
  email: Joi.string(),
  roles: Joi.array().items(Joi.number()),
  password: Joi.string(),
  class: Joi.string(),
});

router.post("/", async (req, res) => {
  const database = getDatabase("repa");
  if (!database) {
    res.sendStatus(500);
    return;
  }

  const body = req.body;
  const bodyValid = updateUserSchema.validate(body);
  if (bodyValid.error) {
    res.json(bodyValid.error);
    return;
  }

  const token = req.headers.authorization;
  if (!token) {
    res.sendStatus(403);
    return;
  }

  const session = await getSession({ token });
  if (!session) {
    res.sendStatus(403);
    return;
  }

  const user = await getUser({ id: session.owner });
  if (!user) {
    res.sendStatus(500);
    return;
  }

  if (!hasRoles(user, [Roles.Admin])) {
    res.sendStatus(403);
    return;
  }

  res.json(await updateUser({ id: body.id }, body as UserLike));
});

router.get("/", async (req, res) => {
  const database = getDatabase("repa");
  if (!database) {
    res.sendStatus(500);
    return;
  }
  const token = req.headers.authorization;
  if (!token) {
    res.sendStatus(403);
    return;
  }

  const session = await getSession({ token });
  if (!session) {
    res.sendStatus(403);
    return;
  }

  const user = await getUser({ id: session.owner });
  console.log(session);
  if (!user) {
    res.sendStatus(500);
    return;
  }

  if (!hasRoles(user, [Roles.Admin])) {
    res.sendStatus(403);
    return;
  }

  res.json(await getUsers());
});

export default router;
