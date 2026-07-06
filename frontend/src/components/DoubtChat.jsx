// frontend/src/components/DoubtChat.jsx
import { useState, useEffect, useRef } from "react";
import "../styles/DoubtChat.css";

function DoubtChat({ subjectId, subjectName, topicId, topicName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ai/doubt/${subjectId}${topicId ? `?topicId=${topicId}` : ""}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    if (subjectId) loadHistory();
  }, [subjectId, topicId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/doubt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: trimmed,
          subjectId,
          topicId,
          subjectName,
          topicName,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, couldn't connect right now. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="doubt-chat">
      <div className="doubt-chat__header">
        Ask a doubt {subjectName ? `— ${subjectName}` : ""}
        {topicName && <span className="doubt-chat__topic"> · {topicName}</span>}
      </div>

      <div className="doubt-chat__messages" ref={scrollRef}>
        {messages.length === 0 && (
          <p className="doubt-chat__empty">Stuck on something? Ask away.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`doubt-chat__bubble doubt-chat__bubble--${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="doubt-chat__bubble doubt-chat__bubble--assistant doubt-chat__bubble--loading">
            Thinking...
          </div>
        )}
      </div>

      <div className="doubt-chat__input-row">
        <textarea
          className="doubt-chat__input"
          placeholder="Type your doubt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="doubt-chat__send" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default DoubtChat;