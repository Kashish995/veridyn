import StudyTask from "../models/StudyTask.js";

/**
 * GET /study-tasks/:userId
 * Returns tasks + todayEffortLoad
 */
export const getStudyTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await StudyTask.find({ userId });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const effortPoints = {
      SMALL: 1,
      MEDIUM: 2,
      HEAVY: 3,
    };

    const enrichedTasks = tasks.map((task) => {
      const isOverdue =
        task.deadline &&
        !task.completed &&
        new Date(task.deadline) < now;

      return {
        ...task.toObject(),
        isOverdue,
      };
    });

    const todayEffortLoad = enrichedTasks.reduce((total, task) => {
      if (task.completed) return total;
      if (!task.deadline) return total;

      const taskDate = new Date(task.deadline);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate <= today) {
        const effortValue = effortPoints[task.effort] || 1;
        return total + effortValue;
      }

      return total;
    }, 0);

    const priorityRank = { HIGH: 1, MEDIUM: 2, LOW: 3 };

    enrichedTasks.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      if (priorityRank[a.priority] !== priorityRank[b.priority]) {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }

      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }

      if (a.deadline) return -1;
      if (b.deadline) return 1;

      return 0;
    });

    res.status(200).json({
      tasks: enrichedTasks,
      todayEffortLoad,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

/**
 * POST /study-tasks
 */
export const createStudyTask = async (req, res) => {
  try {
    const { userId, title, priority, effort, deadline } = req.body;

    const task = await StudyTask.create({
      userId,
      title,
      priority,
      effort,
      deadline,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error });
  }
};

/**
 * PATCH /study-tasks/:id
 */
export const updateStudyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await StudyTask.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error });
  }
};

/**
 * DELETE /study-tasks/:id
 */
export const deleteStudyTask = async (req, res) => {
  try {
    const { id } = req.params;
    await StudyTask.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error });
  }
};
