import StudyTask from "../models/StudyTask.js";

// CREATE STUDY TASK
export const createStudyTask = async (req, res) => {
  try {
    const { title, subject, deadline, priority, userId } = req.body;

    const studyTask = await StudyTask.create({
      userId,
      title,
      subject,
      deadline,
      priority,
    });

    res.status(201).json(studyTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// GET STUDY TASKS BY USER
export const getStudyTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await StudyTask.find({ userId }).sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
