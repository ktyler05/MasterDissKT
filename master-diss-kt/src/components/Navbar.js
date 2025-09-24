// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  const [open, setOpen] = React.useState(false);
  const [articlesOpen, setArticlesOpen] = React.useState(false);

  const closeMenus = () => {
    setOpen(false);
    setArticlesOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <h1 className="brand">Cyber Career Paths</h1>

        {/* Desktop links */}
        <div className="nav-links">
          <Link to="/" onClick={closeMenus}>Home</Link>

          <div className="dropdown" onMouseLeave={() => setArticlesOpen(false)}>
            <button
              className="dropbtn"
              style={{ fontFamily: "inherit", fontWeight: 700 }}
              onClick={() => setArticlesOpen((s) => !s)}
            >
              Articles ▾
            </button>
            {articlesOpen && (
              <div className="dropdown-content" onClick={closeMenus}>
                <Link to="/students">Students</Link>
                <Link to="/parents">Parents</Link>
                <Link to="/educators">Educators</Link>
                <Link to="/policy">Policy</Link>
              </div>
            )}
          </div>

          <Link to="/about" onClick={closeMenus}>About</Link>
          <Link to="/thanks" onClick={closeMenus}>Thanks</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="dropbtn"
          aria-label="Open menu"
          onClick={() => setOpen((s) => !s)}
          style={{ display: "none" }}
        />
        <button
          className="dropbtn"
          onClick={() => setOpen((s) => !s)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          <span className="only-mobile">Menu</span>
          <span aria-hidden>☰</span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="mobile-menu" onClick={closeMenus}>
          <Link to="/">Home</Link>
          <details>
            <summary style={{ padding: ".9rem 1rem", cursor: "pointer", fontWeight: 700 }}>
              Articles
            </summary>
            <div style={{ padding: "0 .5rem .5rem" }}>
              <Link to="/students">Students</Link>
              <Link to="/parents">Parents</Link>
              <Link to="/educators">Educators</Link>
              <Link to="/policy">Policy</Link>
            </div>
          </details>
          <Link to="/about">About</Link>
          <Link to="/thanks">Thanks</Link>
        </div>
      )}
    </>
  );
}
