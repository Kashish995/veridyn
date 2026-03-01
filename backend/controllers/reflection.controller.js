import Reflection from "../models/Reflection.js";
import { getToday } from "../utils/date.util.js";

export const saveReflection = async (req, res) => {
  try {
    const userId = req.userId;
    const { reason, note } = req.body;

    const today = getToday();

    const existing = await Reflection.findOne({ userId, date: today });

    if (existing) {
      existing.reason = reason;
      existing.note = note || "";
      await existing.save();
      return res.json(existing);
    }
    if (!content) {
      return res.status(400).json({ message: "Reflection content required" });
    }

    const reflection = await Reflection.create({
      userId,
      date: today,
      reason,
      note: note || "",
    });

    res.json(reflection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save reflection" });
  }
};

export const getTodayReflection = async (req, res) => {
  try {
    const userId = req.userId;
    const today = getToday();

    const reflection = await Reflection.findOne({ userId, date: today });

    res.json(reflection || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reflection" });
  }
};
