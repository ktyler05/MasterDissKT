import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // close dropdown when a link is clicked
  const closeDropdown = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <h1 className="site-title">Cyber Career Paths</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>

        {/* Dropdown for Articles */}
        <div className="dropdown">
          <button className="dropbtn" onClick={toggleDropdown}>
            Articles ▾
          </button>
          {isOpen && (
            <div className="dropdown-content">
              <Link to="/students" onClick={closeDropdown}>Students</Link>
              <Link to="/parents" onClick={closeDropdown}>Parents</Link>
              <Link to="/educators" onClick={closeDropdown}>Educators</Link>
              <Link to="/policy" onClick={closeDropdown}>Policy</Link>
            </div>
          )}
        </div>

        <Link to="/about">About</Link>
        <Link to="/thanks">Thanks</Link>
      </div>
    </nav>
  );
}

export default Navbar;
