import express from "express";
import { getUsers, deleteUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔒 PROTECTED ROUTES
router.get("/", authMiddleware, getUsers);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
