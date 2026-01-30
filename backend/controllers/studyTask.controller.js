import StudyTask from "../models/StudyTask.js";

export const createTask = async (req, res) => {
  try {
    const { subjectId, title, targetChapters, date } = req.body;

    if (!subjectId || !title || !targetChapters || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const task = await StudyTask.create({
      userId: req.user.id,
      subjectId,
      title,
      targetChapters,
      date
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
};
