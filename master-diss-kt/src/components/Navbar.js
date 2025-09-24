// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [articlesOpen, setArticlesOpen] = React.useState(false);

  const closeMenus = () => {
    setArticlesOpen(false);
  };

  return (
    <nav className="navbar">
      <h1 className="brand">Cyber Career Paths</h1>

      <div className="nav-links">
        <Link to="/" onClick={closeMenus}>
          Home
        </Link>

        <div
          className="dropdown"
          onMouseLeave={() => setArticlesOpen(false)}
        >
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

        <Link to="/about" onClick={closeMenus}>
          About
        </Link>
        <Link to="/thanks" onClick={closeMenus}>
          Thanks
        </Link>
      </div>
    </nav>
  );
}
