import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Parents from "./pages/Parents";
import Educators from "./pages/Educators";
import Policy from "./pages/Policy";
import About from "./pages/About";
import Thanks from "./pages/Thanks";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/educators" element={<Educators />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/about" element={<About />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}
