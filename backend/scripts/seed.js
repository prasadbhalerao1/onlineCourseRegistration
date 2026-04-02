const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Course = require("../models/Course");
const Student = require("../models/Student");
const studentService = require("../services/studentService");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const firstNames = [
    "Aarav",
    "Ishita",
    "Riya",
    "Vihaan",
    "Anaya",
    "Kabir",
    "Meera",
    "Arjun",
    "Diya",
    "Reyansh",
    "Saanvi",
    "Aditya",
    "Nitya",
    "Rahul",
    "Neha",
];

const lastNames = [
    "Sharma",
    "Patel",
    "Reddy",
    "Iyer",
    "Kapoor",
    "Verma",
    "Menon",
    "Gupta",
    "Nair",
    "Singh",
];

const instructors = [
    "Dr. Priya Nair",
    "Prof. Arjun Menon",
    "Dr. Kavya Rao",
    "Prof. Rohan Iyer",
    "Dr. Sneha Kapoor",
];

const courseTemplates = [
    {
        title: "Node.js API Engineering",
        description: "Build scalable REST APIs with Express and MongoDB.",
    },
    {
        title: "React for Product Teams",
        description: "Develop maintainable React applications with modern patterns.",
    },
    {
        title: "Database Design Essentials",
        description: "Model robust relational and document databases for production.",
    },
    {
        title: "Secure Backend Development",
        description: "Implement practical backend security and threat mitigation.",
    },
    {
        title: "Testing JavaScript Applications",
        description: "Write integration and unit tests for reliable software delivery.",
    },
    {
        title: "System Design Foundations",
        description: "Design distributed systems and reason about reliability tradeoffs.",
    },
    {
        title: "Web Performance and Caching",
        description: "Optimize frontend and backend performance under real-world load.",
    },
];

async function createCourses() {
    const courses = [];
    for (const template of courseTemplates) {
        const course = await Course.create({
            title: template.title,
            description: template.description,
            instructor: randomItem(instructors),
            capacity: randomInt(2, 5),
            enrolledCount: 0,
        });
        courses.push(course);
    }
    return courses;
}

async function createStudents(total = 10) {
    const students = [];
    for (let i = 0; i < total; i += 1) {
        const first = randomItem(firstNames);
        const last = randomItem(lastNames);
        const name = `${first} ${last}`;
        const email = `${first}.${last}.${Date.now()}.${i}@example.com`.toLowerCase();
        const student = await studentService.createStudent({ name, email });
        students.push(student);
    }
    return students;
}

async function enrollRandomly(students, courses) {
    for (const student of students) {
        const picks = randomInt(1, Math.min(3, courses.length));
        const chosen = shuffle(courses).slice(0, picks);

        for (const course of chosen) {
            try {
                await studentService.enrollStudentInCourse(
                    student._id.toString(),
                    course._id.toString(),
                );
            } catch (error) {
                // Full capacity can happen naturally during random seeding.
                if (error.message !== "Course is at full capacity") {
                    throw error;
                }
            }
        }
    }
}

async function runEdgeCases(students, courses) {
    const results = [];

    // 1) Duplicate email should fail
    try {
        await studentService.createStudent({
            name: "Duplicate Email",
            email: students[0].email,
        });
        results.push("FAIL: duplicate email was allowed");
    } catch (error) {
        results.push(`PASS: duplicate email blocked (${error.message})`);
    }

    // 2) Missing courseId should fail
    try {
        await studentService.enrollStudentInCourse(students[0]._id.toString());
        results.push("FAIL: missing courseId was allowed");
    } catch (error) {
        results.push(`PASS: missing courseId blocked (${error.message})`);
    }

    // 3) Duplicate enrollment should fail
    const targetStudent = students[1];
    const targetCourse = courses[0];
    await studentService.enrollStudentInCourse(
        targetStudent._id.toString(),
        targetCourse._id.toString(),
    ).catch(() => {});

    try {
        await studentService.enrollStudentInCourse(
            targetStudent._id.toString(),
            targetCourse._id.toString(),
        );
        results.push("FAIL: duplicate enrollment was allowed");
    } catch (error) {
        results.push(`PASS: duplicate enrollment blocked (${error.message})`);
    }

    // 4) Full-capacity enrollment should fail
    const tinyCourse = await Course.create({
        title: "Edge Case Tiny Course",
        description: "Used to verify full-capacity behavior.",
        instructor: randomItem(instructors),
        capacity: 1,
        enrolledCount: 0,
    });

    await studentService.enrollStudentInCourse(
        students[2]._id.toString(),
        tinyCourse._id.toString(),
    );

    try {
        await studentService.enrollStudentInCourse(
            students[3]._id.toString(),
            tinyCourse._id.toString(),
        );
        results.push("FAIL: full-capacity enrollment was allowed");
    } catch (error) {
        results.push(`PASS: full-capacity blocked (${error.message})`);
    }

    // 5) Unenroll when not enrolled should fail
    try {
        await studentService.unenrollStudentFromCourse(
            students[4]._id.toString(),
            tinyCourse._id.toString(),
        );
        results.push("FAIL: unenroll-not-enrolled was allowed");
    } catch (error) {
        results.push(`PASS: unenroll-not-enrolled blocked (${error.message})`);
    }

    return results;
}

async function main() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required. Set it in backend/.env");
    }

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    // Reset data for deterministic seeding runs.
    await Promise.all([Course.deleteMany({}), Student.deleteMany({})]);

    const courses = await createCourses();
    const students = await createStudents(10);
    await enrollRandomly(students, courses);
    const edgeCaseResults = await runEdgeCases(students, courses);

    const [courseCount, studentCount] = await Promise.all([
        Course.countDocuments(),
        Student.countDocuments(),
    ]);

    const finalCourses = await Course.find().sort({ title: 1 });

    console.log("\nSeed complete.");
    console.log(`Courses: ${courseCount}`);
    console.log(`Students: ${studentCount}`);
    console.log("\nEdge-case coverage:");
    edgeCaseResults.forEach((line) => console.log(`- ${line}`));

    console.log("\nCourse occupancy:");
    finalCourses.forEach((course) => {
        console.log(
            `- ${course.title}: ${course.enrolledCount}/${course.capacity}`,
        );
    });
}

main()
    .catch((error) => {
        console.error("Seed failed:", error.message || error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
