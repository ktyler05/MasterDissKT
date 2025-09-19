import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="site-title">Cyber Career Paths</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/students">Students</Link>
        <Link to="/parents">Parents</Link>
        <Link to="/educators">Educators</Link>
        <Link to="/policy">Policy</Link>
      </div>
    </nav>
  );
}

export default Navbar;