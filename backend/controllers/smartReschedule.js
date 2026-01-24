import Task from "../models/Task.js";

export const smartReschedule = async (userId, date) => {
  const tasks = await Task.find({
    userId,
    dueDate: date,
    status: { $ne: "completed" },
  });

  let totalTime = 0;
  tasks.forEach(t => totalTime += t.estimatedTime);

  const HEAVY_DAY_LIMIT = 360; // 6 hours

  if (totalTime > HEAVY_DAY_LIMIT) {
    for (let task of tasks) {
      if (task.priority === "low") {
        task.suggestedForTomorrow = true;
        await task.save();
      }

      if (task.estimatedTime > 120) {
        const half = Math.floor(task.estimatedTime / 2);

        await Task.create({
          title: task.title + " (Part 2)",
          description: task.description,
          priority: task.priority,
          dueDate: new Date(task.dueDate.getTime() + 86400000),
          estimatedTime: half,
          userId: task.userId,
          splitFrom: task._id,
        });

        task.estimatedTime = half;
        await task.save();
      }
    }
  }
};
