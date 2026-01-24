const StudyTaskCard = ({ task, onToggleComplete, onDelete }) => {
  let backgroundColor = "#f1f5f9"; // default

  if (task.isOverdue) {
    backgroundColor = "#ffdede"; // red-ish
  } else if (task.priority === "HIGH") {
    backgroundColor = "#fff3cd"; // yellow-ish
  }

  return (
    <div
      style={{
        backgroundColor,
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task._id, task.completed)}
        />

        <span
          style={{
            marginLeft: "8px",
            textDecoration: task.completed ? "line-through" : "none",
          }}
        >
          {task.title} | Priority: {task.priority}
          {task.deadline && (
            <> | Deadline: {new Date(task.deadline).toLocaleDateString()}</>
          )}
        </span>

        {task.isOverdue && (
          <span style={{ color: "red", marginLeft: "8px", fontWeight: "bold" }}>
            OVERDUE
          </span>
        )}
      </div>

      <button onClick={() => onDelete(task._id)}>Delete</button>
    </div>
  );
};

export default StudyTaskCard;
