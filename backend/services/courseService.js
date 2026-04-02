const Course = require('../models/Course');
const Student = require('../models/Student');

const getAllCourses = async () => Course.find();

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  return course;
};

const createCourse = async (payload) => {
  const course = new Course({
    title: payload.title,
    description: payload.description,
    instructor: payload.instructor,
    capacity: payload.capacity
  });

  return course.save();
};

const updateCourse = async (courseId, payload) => {
  const updatedCourse = await Course.findByIdAndUpdate(courseId, payload, {
    new: true,
    runValidators: true
  });

  if (!updatedCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedCourse;
};

const deleteCourse = async (courseId) => {
  const deletedCourse = await Course.findByIdAndDelete(courseId);

  if (!deletedCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  await Student.updateMany(
    { registeredCourses: courseId },
    { $pull: { registeredCourses: courseId } }
  );

  return deletedCourse;
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
