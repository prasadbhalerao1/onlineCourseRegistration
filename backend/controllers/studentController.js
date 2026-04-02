const studentService = require("../services/studentService");

const getAllStudents = async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        res.json(students);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await studentService.getStudentById(req.params.id);
        res.json(student);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const createStudent = async (req, res) => {
    try {
        const newStudent = await studentService.createStudent(req.body);
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

const enrollStudentInCourse = async (req, res) => {
    try {
        const { student, course } = await studentService.enrollStudentInCourse(
            req.params.id,
            req.body.courseId,
        );

        res.json({ message: "Successfully enrolled", student, course });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const unenrollStudentFromCourse = async (req, res) => {
    try {
        const { student, course } =
            await studentService.unenrollStudentFromCourse(
                req.params.id,
                req.params.courseId,
            );

        res.json({ message: "Successfully unenrolled", student, course });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    enrollStudentInCourse,
    unenrollStudentFromCourse,
};
