import { Link } from "react-router-dom";

export default function Brand({ footer = false }) {
  return (
    <Link className={`brand-link${footer ? " brand-link-footer" : ""}`} to="/" aria-label="MONOLITH — início">
      <svg className="brand-symbol" viewBox="0 0 36 36" aria-hidden="true">
        <path d="M18 2 34 11v14L18 34 2 25V11L18 2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m18 8 10 5.7v8.6L18 28l-10-5.7v-8.6L18 8Z" fill="currentColor" opacity=".22" />
        <path d="M18 8v20m10-14.3-20 11.6m20 0L8 13.7" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      <span>MONOLITH</span>
    </Link>
  );
}
