
import "../styles/badge.css";

export default function Badge({ label, tier }) {
  return (
    <span className={`badge badge-${tier.toLowerCase()}`}>
      {label || tier}
    </span>
  );
}