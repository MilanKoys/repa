import express from "express";

import attendance from "./attendance.js";

const router = express.Router();

router.use(attendance);

export default router;
