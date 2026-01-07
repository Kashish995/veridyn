import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.create({ name, email, role });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};