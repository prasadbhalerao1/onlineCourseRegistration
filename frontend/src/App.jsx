import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CourseList from './pages/CourseList';
import ManageCourses from './pages/ManageCourses';
import StudentDashboard from './pages/StudentDashboard';
import axios from 'axios';

function App() {
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
      if (res.data.length > 0 && !activeStudent) {
        setActiveStudent(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching students (is backend running?):', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="page-container animate-fade-in">
        <div className="user-selector glass-panel">
          <label htmlFor="student-select" style={{ color: 'var(--text-muted)' }}>Demo Mode: Act as Student</label>
          <select 
            id="student-select"
            value={activeStudent} 
            onChange={(e) => setActiveStudent(e.target.value)}
          >
            <option value="">-- Select or Create a Student --</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => {
            const name = prompt("Enter student name:");
            const email = prompt("Enter student email:");
            if (name && email) {
              axios.post('http://localhost:5000/api/students', { name, email })
                .then(() => fetchStudents())
                .catch(err => alert("Error creating student"));
            }
          }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>+ Create Demo Student</button>
        </div>

        <Routes>
          <Route path="/" element={<CourseList activeStudent={activeStudent} />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/dashboard" element={<StudentDashboard activeStudent={activeStudent} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
