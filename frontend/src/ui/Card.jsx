import "../styles/card.css";

import "../styles/card.css";

export default function Card({
  title,
  subtitle,
  children,
  variant = "default",
  className = ""
}) {
  return (
    <div className={`card card-${variant} ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      <div className="card-content">{children}</div>
    </div>
  );
}