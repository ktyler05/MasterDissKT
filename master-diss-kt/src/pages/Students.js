import React from "react";
import studentImage from '../image/student.png';

function Students() {
  return (
    <div className="page">
      <h2>For Students</h2>
      <img src={studentImage} alt="Cyber Careers Hub" className="student-image" />
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet fermentum odio. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.</p>
    </div>
  );
}

export default Students;