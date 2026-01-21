// frontend/src/components/StudyTaskCard.jsx
export default function StudyTaskCard({ task, onComplete, onDelete }) {
  return (
    <div className="task-card">
      <div>
        <h4>{task.title}</h4>
        <small>Status: {task.status}</small>
      </div>

      <div className="actions">
        {task.status !== "completed" && (
          <button onClick={() => onComplete(task._id)}>
            Mark Done
          </button>
        )}

        <button onClick={() => onDelete(task._id)}>❌</button>
      </div>
    </div>
  );
}
