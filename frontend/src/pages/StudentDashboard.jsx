import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookX, GraduationCap } from 'lucide-react';

const StudentDashboard = ({ activeStudent }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchStudentData = async () => {
    if (!activeStudent) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.get(`${API_URL}/students/${activeStudent}`);
      setStudentData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [activeStudent]);

  const handleUnenroll = async (courseId) => {
    if (window.confirm("Are you sure you want to drop this course?")) {
      try {
        await axios.delete(`${API_URL}/students/${activeStudent}/enroll/${courseId}`);
        fetchStudentData(); // Refresh UI
      } catch (err) {
        alert(err.response?.data?.message || "Error unenrolling");
      }
    }
  };

  if (loading) return <div className="loader"></div>;

  if (!activeStudent) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2 className="heading-lg">Welcome to your Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Please select a student account from the top dropdown to view your enrolled courses.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(0,0,0,0.2))' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {studentData?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="heading-xl" style={{ marginBottom: '0.2rem', fontSize: '2.5rem' }}>Hello, {studentData?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{studentData?.email} | Student Portal</p>
        </div>
      </div>

      <h3 className="heading-lg" style={{ fontSize: '1.8rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>My Enrolled Courses</h3>
      
      {studentData?.registeredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>You are not currently enrolled in any courses.</p>
          <a href="/" className="btn btn-primary">Browse Course Catalog</a>
        </div>
      ) : (
        <div className="grid-container" style={{ marginTop: '1.5rem' }}>
          {studentData?.registeredCourses.map(course => (
            <div key={course._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
              <div>
                <h3 className="card-title">{course.title}</h3>
                <p className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <GraduationCap size={16} /> {course.instructor}
                </p>
              </div>
              <p className="card-content">{course.description}</p>
              <div className="card-footer" style={{ borderTop: 'none', paddingTop: '0', marginTop: 'auto' }}>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleUnenroll(course._id)}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  <BookX size={18} /> Drop Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
