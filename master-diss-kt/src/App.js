// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Parents from "./pages/Parents";
import Educators from "./pages/Educators";
import Policy from "./pages/Policy";
import Thanks from "./pages/Thanks";
import About from "./pages/About";


function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/educators" element={<Educators />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;