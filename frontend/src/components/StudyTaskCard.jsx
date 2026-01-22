const StudyTaskCard = ({ task, onToggleComplete, onDelete }) => {
  const now = new Date();
  const isOverdue =
    task.deadline && new Date(task.deadline) < now && !task.isCompleted;

  let urgencyClass = "task-card";

  if (task.isCompleted) {
    urgencyClass += " completed";
  } else if (isOverdue) {
    urgencyClass += " overdue";
  } else if (task.priority === "HIGH") {
    urgencyClass += " high";
  } else if (task.priority === "MEDIUM") {
    urgencyClass += " medium";
  } else if (task.priority === "LOW") {
    urgencyClass += " low";
  }

  return (
    <div className={urgencyClass}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggleComplete(task._id, task.isCompleted)}
      />

      <span>{task.title}</span>

      <span>Priority: {task.priority}</span>

      {task.deadline && (
        <span>
          Deadline: {new Date(task.deadline).toLocaleDateString()}
        </span>
      )}

      {isOverdue && <strong>OVERDUE</strong>}

      <button onClick={() => onDelete(task._id)}>Delete</button>
    </div>
  );
};

export default StudyTaskCard;
