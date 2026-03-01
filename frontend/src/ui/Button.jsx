
import "../styles/button.css";

export default function Button({ children, variant = "primary", loading = false, disabled = false, ...props }) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-loader">...</span> : children}
    </button>
  );
}