import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { getDatabase } from "../../database.js";
const router = express.Router();
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
router.post("/login", async (req, res) => {
    const database = getDatabase("repa");
    if (!database) {
        res.sendStatus(500);
        return;
    }
    const users = database.collection("users");
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
    res.json({ token: nanoid() });
});
export default router;
