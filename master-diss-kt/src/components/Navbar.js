import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [articlesOpen, setArticlesOpen] = React.useState(false);
  const loc = useLocation();
  const dropRef = React.useRef(null);

  React.useEffect(() => {
    setArticlesOpen(false);
  }, [loc.pathname]);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (!articlesOpen) return;
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setArticlesOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [articlesOpen]);

  return (
    <nav className="navbar">
      <h1 className="brand">Cyber Career Paths</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <div className="dropdown" ref={dropRef}>
          <button
            className="dropbtn"
            onClick={() => setArticlesOpen((s) => !s)}
            aria-expanded={articlesOpen}
            aria-haspopup="true"
          >
            Articles ▾
          </button>

          {articlesOpen && (
            <div className="dropdown-content" role="menu">
              <Link to="/students" role="menuitem">Students</Link>
              <Link to="/parents" role="menuitem">Parents</Link>
              <Link to="/educators" role="menuitem">Educators</Link>
              <Link to="/policy" role="menuitem">Policy</Link>
            </div>
          )}
        </div>

        <Link to="/contact">Contact-me</Link>
        <Link to="/thanks">Thanks</Link>
      </div>
    </nav>
  );
}
