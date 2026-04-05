import { Router } from "express";
import { getUsers, createUser } from "../controllers/user.controller.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// ── Existing routes ──────────────────────────
router.get("/", getUsers);
router.post("/", createUser);

// ── New: Update display name + role ──────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ── New: Change password ──────────────────────
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;