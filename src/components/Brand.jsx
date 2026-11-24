import { Link } from "react-router-dom";

export default function Brand({ footer = false }) {
  return (
    <Link className={`brand-link${footer ? " brand-link-footer" : ""}`} to="/" aria-label="RHIZAM — início">
      <span className="brand-mark" aria-hidden="true">R</span>
      <span className="brand-name">RHIZAM</span>
    </Link>
  );
}
