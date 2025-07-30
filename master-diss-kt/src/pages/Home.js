import React from "react";
import { Link } from "react-router-dom";
import homeImage from '../image/home.png';

function Home() {
  return (
    <div className="page">
      <h2>Welcome to the Cyber Careers Hub</h2>

      <p>
        The UK’s cyber security industry is growing fast, but there’s still a disconnect between education, awareness, and opportunity.
        This project explores how young people, parents, educators, and industry leaders can work together to bridge that gap.
      </p>

      <p>
        Here you’ll find accessible, research-backed articles aimed at helping students discover real cyber career routes,
        guiding parents on how to support them, and offering insights for educators and policymakers working to shape the future of digital skills.
      </p>

      <p>
        Whether you're curious, concerned, or creating change, we’re glad you’re here.
      </p>

      <div className="button-group">
        <Link to="/students" className="custom-btn">For Students</Link>
        <Link to="/parents" className="custom-btn">For Parents</Link>
        <Link to="/educators" className="custom-btn">For Educators/Policymakers</Link>
      </div>

      <img src={homeImage} alt="Cyber Careers Hub" className="home-image" />
    </div>
  );
}

export default Home;
