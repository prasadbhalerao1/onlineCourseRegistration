import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', instructor: '', capacity: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/courses/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/courses', formData);
      }
      setFormData({ title: '', description: '', instructor: '', capacity: '' });
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving course");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      capacity: course.capacity
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`);
        fetchCourses();
      } catch (err) {
        alert("Error deleting course");
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
      <div>
        <h2 className="heading-lg">Admin View: Manage Courses</h2>
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label>Course Title</label>
            <input type="text" className="input-field" required 
                   value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input-field" required rows="3"
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div className="form-group">
            <label>Instructor Name</label>
            <input type="text" className="input-field" required 
                   value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" className="input-field" required min="1"
                   value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Course' : 'Create Course'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-danger" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', instructor: '', capacity: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Existing Courses</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course._id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{course.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{course.instructor} • {course.enrolledCount}/{course.capacity} Students</p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => handleEdit(course)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}><Edit size={20} /></button>
                <button onClick={() => handleDelete(course._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No courses found.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
