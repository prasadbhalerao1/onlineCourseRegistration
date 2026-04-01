import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap } from 'lucide-react';

const CourseList = ({ activeStudent }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    if (!activeStudent) return alert("Please select a student from the Demo Mode dropdown first!");
    try {
      await axios.post(`http://localhost:5000/api/students/${activeStudent}/enroll`, { courseId });
      alert("Successfully enrolled!");
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll");
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="animate-fade-in">
      <h2 className="heading-xl">Available Courses</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>Expand your knowledge with our premium selection of online courses.</p>
      
      <div className="grid-container">
        {courses.map(course => {
          const isFull = course.enrolledCount >= course.capacity;
          return (
            <div key={course._id} className="card glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${isFull ? 'badge-primary' : 'badge-success'}`}>
                  {isFull ? 'FULLY BOOKED' : 'OPEN'}
                </span>
              </div>
              
              <div>
                <h3 className="card-title">{course.title}</h3>
                <p className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <GraduationCap size={16} /> {course.instructor}
                </p>
              </div>
              
              <p className="card-content">{course.description}</p>
              
              <div className="card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Users size={16} />
                  <span>{course.enrolledCount} / {course.capacity} students</span>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleEnroll(course._id)}
                  disabled={isFull}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {isFull ? 'Capacity Reached' : 'Enroll Now'}
                </button>
              </div>
            </div>
          );
        })}
        {courses.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No courses available. Check back soon or create one in the Admin tab.</p>}
      </div>
    </div>
  );
};

export default CourseList;
