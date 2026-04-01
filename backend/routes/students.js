const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('registeredCourses');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate('registeredCourses');
      if (!student) return res.status(404).json({ message: 'Student not found' });
      res.json(student);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// POST a new student
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    email: req.body.email
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST enroll student in a course
router.post('/:id/enroll', async (req, res) => {
  const { courseId } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if already enrolled
    if (student.registeredCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Check capacity
    if (course.enrolledCount >= course.capacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }

    // Update models
    student.registeredCourses.push(courseId);
    await student.save();

    course.enrolledCount += 1;
    await course.save();

    res.json({ message: 'Successfully enrolled', student, course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE unenroll student from a course
router.delete('/:id/enroll/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if enrolled
    if (!student.registeredCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    // Update models
    student.registeredCourses = student.registeredCourses.filter(
      id => id.toString() !== courseId
    );
    await student.save();

    course.enrolledCount = Math.max(0, course.enrolledCount - 1);
    await course.save();

    res.json({ message: 'Successfully unenrolled', student, course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
