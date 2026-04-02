const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getAllStudents = async () => Student.find().populate('registeredCourses');

const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId).populate('registeredCourses');

  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  return student;
};

const createStudent = async (payload) => {
  if (!payload?.name || !payload?.email) {
    const error = new Error('Name and email are required');
    error.statusCode = 400;
    throw error;
  }

  const student = new Student({ name: payload.name, email: payload.email });

  try {
    return await student.save();
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A student with this email already exists');
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

const enrollStudentInCourse = async (studentId, courseId) => {
  if (!courseId) {
    const error = new Error('courseId is required');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  if (student.registeredCourses.some((id) => id.toString() === courseId)) {
    const error = new Error('Student already enrolled in this course');
    error.statusCode = 400;
    throw error;
  }

  if (course.enrolledCount >= course.capacity) {
    const error = new Error('Course is at full capacity');
    error.statusCode = 400;
    throw error;
  }

  student.registeredCourses.push(courseId);
  await student.save();

  course.enrolledCount += 1;
  await course.save();

  return { student, course };
};

const unenrollStudentFromCourse = async (studentId, courseId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const isEnrolled = student.registeredCourses.some((id) => id.toString() === courseId);
  if (!isEnrolled) {
    const error = new Error('Student is not enrolled in this course');
    error.statusCode = 400;
    throw error;
  }

  student.registeredCourses = student.registeredCourses.filter((id) => id.toString() !== courseId);
  await student.save();

  course.enrolledCount = Math.max(0, course.enrolledCount - 1);
  await course.save();

  return { student, course };
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
};
