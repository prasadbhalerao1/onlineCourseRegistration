import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { Users, GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import EnrollmentModal from "../components/EnrollmentModal";
import CourseDetailDrawer from "../components/CourseDetailDrawer";

const EmptyState = () => (
    <div className="empty-state">
        <div className="empty-state__icon">
            <BookOpen size={36} />
        </div>
        <p className="empty-state__title">No courses yet</p>
        <p className="empty-state__subtitle">
            There are no courses available right now. Ask an admin to create one
            in the <strong>Admin Manage</strong> tab.
        </p>
    </div>
);

const SkeletonCard = () => (
    <div className="card glass-panel" style={{ gap: "1rem" }}>
        <div
            className="skeleton skeleton-line"
            style={{ width: "30%", height: "22px" }}
        />
        <div
            className="skeleton skeleton-line"
            style={{ width: "75%", height: "18px" }}
        />
        <div
            className="skeleton skeleton-line"
            style={{ width: "55%", height: "14px" }}
        />
        <div className="skeleton skeleton-line" style={{ height: "14px" }} />
        <div
            className="skeleton skeleton-line"
            style={{ width: "80%", height: "14px" }}
        />
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: "0.85rem",
                borderTop: "1px solid var(--card-border)",
            }}
        >
            <div
                className="skeleton skeleton-line"
                style={{ width: "35%", height: "12px", marginBottom: 0 }}
            />
            <div
                className="skeleton"
                style={{ width: "90px", height: "32px", borderRadius: "8px" }}
            />
        </div>
    </div>
);

const CourseList = ({
    activeStudent,
    syncVersion,
    onEnrollmentChange,
    onCreateStudent,
    onNotify,
}) => {
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [drawerCourse, setDrawerCourse] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
    const [enrollingCourseId, setEnrollingCourseId] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const courseReq = api.get("/courses");
            const studentReq = activeStudent
                ? api.get(`/students/${activeStudent}`)
                : null;
            const [courseRes, studentRes] = await Promise.all([
                courseReq,
                studentReq,
            ]);

            setCourses(courseRes.data);

            if (studentRes?.data?.registeredCourses) {
                const ids = studentRes.data.registeredCourses.map((c) => c._id);
                setEnrolledCourseIds(new Set(ids));
            } else {
                setEnrolledCourseIds(new Set());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeStudent]);

    useEffect(() => {
        fetchData();
    }, [fetchData, syncVersion]);

    const handleCardClick = (course) => {
        setDrawerCourse(course);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        // Keep drawerCourse set briefly for exit animation, then clear
        setTimeout(() => setDrawerCourse(null), 320);
    };

    // Called from either the "Enroll Now" button directly or from inside the drawer
    const handleEnrollClick = (course) => {
        // Capture the course immediately before any async state clearing
        const courseSnapshot = { ...course };
        setModalError("");
        setSelectedCourse(courseSnapshot);
        // Close drawer cleanly (this also nulls drawerCourse after animation)
        setIsDrawerOpen(false);
        setTimeout(() => setDrawerCourse(null), 320);
    };

    const closeModal = useCallback(
        (force = false) => {
            if (isSubmitting && !force) return;
            setSelectedCourse(null);
            setModalError("");
        },
        [isSubmitting],
    );

    const handleModalSubmit = async ({ name, email }) => {
        if (!selectedCourse) return;

        setIsSubmitting(true);
        setEnrollingCourseId(selectedCourse._id);
        setModalError("");

        let studentId = activeStudent;

        try {
            if (!studentId) {
                const created = await onCreateStudent(name, email);
                studentId = created._id;
            }

            await api.post(`/students/${studentId}/enroll`, {
                courseId: selectedCourse._id,
            });
            onNotify(
                `You're enrolled in ${selectedCourse.title}! 🎉`,
                "success",
            );
            onEnrollmentChange();
            await fetchData();
            closeModal(true);
        } catch (err) {
            const msg =
                err.displayMessage || "Failed to enroll. Please try again.";
            setModalError(msg);
            onNotify(msg, "error");
        } finally {
            setIsSubmitting(false);
            setEnrollingCourseId("");
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div style={{ marginBottom: "2.5rem" }}>
                    <div
                        className="skeleton skeleton-line"
                        style={{
                            width: "40%",
                            height: "48px",
                            marginBottom: "0.75rem",
                        }}
                    />
                    <div
                        className="skeleton skeleton-line"
                        style={{ width: "65%", height: "18px" }}
                    />
                </div>
                <div className="grid-container">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "2.5rem" }}>
                <h2 className="heading-xl">Available Courses</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
                    Expand your knowledge with our curated selection of online
                    courses.
                    {!activeStudent && (
                        <span
                            style={{ color: "#a5b4fc", marginLeft: "0.5rem" }}
                        >
                            Click a course to enroll — we'll register you
                            instantly.
                        </span>
                    )}
                </p>
            </div>

            <div className="grid-container">
                {courses.length === 0 ? (
                    <EmptyState />
                ) : (
                    courses.map((course) => {
                        const isFull = course.enrolledCount >= course.capacity;
                        const isEnrolled = enrolledCourseIds.has(course._id);
                        const seatsLeft =
                            course.capacity - course.enrolledCount;

                        return (
                            <div
                                key={course._id}
                                className={`card glass-panel course-card ${isEnrolled ? "course-card--enrolled" : ""}`}
                                onClick={() => handleCardClick(course)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleCardClick(course)
                                }
                            >
                                {/* Top row */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        className={`badge ${isEnrolled ? "badge-enrolled" : isFull ? "badge-full" : "badge-success"}`}
                                    >
                                        {isEnrolled
                                            ? "✓ Enrolled"
                                            : isFull
                                              ? "Full"
                                              : "Open"}
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        style={{
                                            color: "var(--text-muted)",
                                            opacity: 0.6,
                                        }}
                                    />
                                </div>

                                <div>
                                    <h3 className="card-title">
                                        {course.title}
                                    </h3>
                                    <p
                                        className="card-subtitle"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                            marginTop: "0.4rem",
                                        }}
                                    >
                                        <GraduationCap size={15} />{" "}
                                        {course.instructor}
                                    </p>
                                </div>

                                <p className="card-content">
                                    {course.description}
                                </p>

                                {/* Capacity bar */}
                                <div className="capacity-bar-track">
                                    <div
                                        className="capacity-bar-fill"
                                        style={{
                                            width: `${Math.min(100, (course.enrolledCount / course.capacity) * 100)}%`,
                                            background: isFull
                                                ? "#ef4444"
                                                : seatsLeft <= 3
                                                  ? "#f59e0b"
                                                  : "var(--primary)",
                                        }}
                                    />
                                </div>

                                {/* Footer */}
                                <div
                                    className="card-footer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                            color: "var(--text-muted)",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        <Users size={15} />
                                        <span>
                                            {course.enrolledCount} /{" "}
                                            {course.capacity}
                                        </span>
                                        {seatsLeft <= 5 &&
                                            seatsLeft > 0 &&
                                            !isEnrolled && (
                                                <span
                                                    style={{
                                                        color: "#fbbf24",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    ({seatsLeft} left)
                                                </span>
                                            )}
                                    </div>

                                    <button
                                        className={`btn btn-sm ${isEnrolled ? "btn-enrolled" : isFull ? "btn-ghost" : "btn-primary"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isEnrolled && !isFull)
                                                handleEnrollClick(course);
                                        }}
                                        disabled={
                                            isFull ||
                                            isEnrolled ||
                                            enrollingCourseId === course._id
                                        }
                                    >
                                        {enrollingCourseId === course._id
                                            ? "Enrolling..."
                                            : isEnrolled
                                              ? "✓ Enrolled"
                                              : isFull
                                                ? "Full"
                                                : "Enroll Now"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <CourseDetailDrawer
                course={drawerCourse}
                isOpen={isDrawerOpen}
                isEnrolled={
                    drawerCourse
                        ? enrolledCourseIds.has(drawerCourse._id)
                        : false
                }
                onClose={handleDrawerClose}
                onEnrollClick={() =>
                    drawerCourse && handleEnrollClick(drawerCourse)
                }
            />

            <EnrollmentModal
                isOpen={Boolean(selectedCourse)}
                course={selectedCourse}
                requiresRegistration={!activeStudent}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                isSubmitting={isSubmitting}
                errorMessage={modalError}
            />
        </div>
    );
};

export default CourseList;
