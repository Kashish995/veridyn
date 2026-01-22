import StudyTask from "../models/StudyTask.js";

// CREATE STUDY TASK
export const createStudyTask = async (req, res) => {
  try {
    const { title, deadline, priority, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: "userId and title are required" });
    }

    const studyTask = await StudyTask.create({
      userId,
      title,
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
    const now = new Date();

    const tasks = await StudyTask.find({ userId }).lean();

    const priorityRank = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    const sortedTasks = tasks.sort((a, b) => {
      // completed always last
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      const aOverdue = a.deadline && a.deadline < now;
      const bOverdue = b.deadline && b.deadline < now;

      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      return priorityRank[a.priority] - priorityRank[b.priority];
    });

    res.status(200).json(sortedTasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

