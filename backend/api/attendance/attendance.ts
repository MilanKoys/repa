import express from "express";
import { getUserFromToken } from "../../users.js";
import {
  createAttendance,
  getAttendance,
  updateAttendance,
} from "../../attendance.js";
import { getLiveSeason } from "../../season.js";
import Joi from "joi";

const router = express.Router();

const createAttendanceSchema = Joi.object({
  week: Joi.number().required(),
});

const updateAttendanceSchema = Joi.object({
  content: Joi.array()
    .items(
      Joi.object({
        subject: Joi.string().required(),
        description: Joi.string().required(),
        hours: Joi.number().required(),
      })
    )
    .required(),
});

router.get("/season", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return errorStatus(403);

  const user = await getUserFromToken(token);
  if (typeof user === "number") return errorStatus(403);

  res.json(await getLiveSeason());

  function errorStatus(status: number) {
    res.sendStatus(status);
    return;
  }
});

router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return errorStatus(403);

  const user = await getUserFromToken(token);
  if (typeof user === "number") return errorStatus(403);

  res.json(await getAttendance(user));

  function errorStatus(status: number) {
    res.sendStatus(status);
    return;
  }
});

router.post("/:id", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return errorStatus(403);

  const params = req.params;
  if (!params.id) return errorStatus(401);

  const body = req.body;
  const bodyValid = updateAttendanceSchema.validate(body);
  if (bodyValid.error) {
    res.json(bodyValid.error);
    return;
  }

  const user = await getUserFromToken(token);
  if (typeof user === "number") return errorStatus(403);

  res.json(await updateAttendance(user, params.id, body.content));

  function errorStatus(status: number) {
    res.sendStatus(status);
    return;
  }
});

router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return errorStatus(403);

  const body = req.body;
  const bodyValid = createAttendanceSchema.validate(body);
  if (bodyValid.error) {
    res.json(bodyValid.error);
    return;
  }

  const user = await getUserFromToken(token);
  if (typeof user === "number") return errorStatus(403);

  res.json(await createAttendance(user, { content: [], week: body.week }));

  function errorStatus(status: number) {
    res.sendStatus(status);
    return;
  }
});

export default router;
