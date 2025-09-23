import React from "react";
import { Link } from "react-router-dom";

function Thanks() {
  return (
    <div
      className="page"
      style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(24,33,95,0.12)",
          border: "1px solid #e9ebf5",
          padding: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#1f2544" }}>
          Acknowledgements
        </h2>
        <p style={{ marginBottom: "1rem", lineHeight: 1.6, color: "#333" }}>
          This project would not have been possible without the support,
          guidance, and generosity of so many people. I would like to extend my
          heartfelt thanks to the following:
        </p>

        <ul
          style={{
            marginBottom: "1.5rem",
            paddingLeft: "1.2rem",
            lineHeight: 1.6,
            color: "#333",
          }}
        >
          <li>
            <strong>Dr Martin Chorley</strong>, Cardiff University – for
            invaluable help and guidance throughout the project.
          </li>
          <li>
            <strong>Jenny Highfield</strong>, Cardiff University – for her
            continued advice, and support within this project.
          </li>
          <li>
            <strong>All my interviewees</strong> – for generously giving their
            time and insights, and for sharing their experiences from across the
            cyber security industry, including:
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
              <li>
                Andrew Bellamy, Senior Lecturer Digital Forensics and Cyber
                Security at the National Cyber Security Academy.{" "}
              </li>
              <li>
                Dr. Yulia Cherdantseva, Senior Lecturer at the School of
                Computer Science & Informatics at Cardiff University
              </li>
              <li>Elaine Haigh, Senior Lecturer in Cybersecurity</li>
              <li>
                Emilia Edwards, Project Pioneers co-founder and industry
                proffesional
              </li>
              <li>
                Dr. Clare Johnson, Cyber Capability Lead at ITSUS Consulting,
                Founder and Director of Women in Cyber Unlimited.
              </li>
              <li>
                Martin Peake, Former Secondary School teacher and industry
                Proffesional
              </li>
              <li>
                Taylor Watson, Project Pioneers co-founder and industry
                professional
              </li>
            </ul>
          </li>
        </ul>

        <p style={{ lineHeight: 1.6, color: "#333" }}>
          To each and every person who contributed – your expertise, advice, and
          encouragement have been instrumental in shaping this work. Thank you.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <Link to="/" style={{ color: "#5AA9FF", fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Thanks;
