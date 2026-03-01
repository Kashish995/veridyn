import "../styles/card.css";

export default function Card({ title, subtitle, children, variant = "default" }) {
  return (
    <div className={`card card-${variant}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      <div className="card-content">{children}</div>
    </div>
  );
}