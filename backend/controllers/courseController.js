const courseService = require("../services/courseService");

const getAllCourses = async (req, res) => {
    try {
        const courses = await courseService.getAllCourses();
        res.json(courses);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        res.json(course);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const newCourse = await courseService.createCourse(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const updatedCourse = await courseService.updateCourse(
            req.params.id,
            req.body,
        );
        res.json(updatedCourse);
    } catch (error) {
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        await courseService.deleteCourse(req.params.id);
        res.json({ message: "Course deleted" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
};
