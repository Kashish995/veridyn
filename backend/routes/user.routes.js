import { Router } from "express";
import { createUser } from "../controllers/user.controller.js";
import User from "../models/User.js";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", createUser);

export default router;
