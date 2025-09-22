import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

 
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);


  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <h1 className="site-title brand">Cyber Career Paths</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>

        {/* Articles dropdown (click to toggle) */}
        <div className="dropdown" ref={dropdownRef}>
          <button className="dropbtn" onClick={toggleDropdown} type="button">
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
