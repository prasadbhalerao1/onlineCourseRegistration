const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.post("/:id/enroll", studentController.enrollStudentInCourse);
router.delete(
    "/:id/enroll/:courseId",
    studentController.unenrollStudentFromCourse,
);

module.exports = router;
