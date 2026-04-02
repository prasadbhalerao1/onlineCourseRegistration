import React, { useState, useEffect } from "react";
import api from "../api";
import {
    BookX,
    GraduationCap,
    LayoutDashboard,
    AlertTriangle,
} from "lucide-react";

const StudentDashboard = ({
    activeStudent,
    syncVersion,
    onEnrollmentChange,
    onNotify,
}) => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [droppingCourseId, setDroppingCourseId] = useState("");
    const [confirmDropId, setConfirmDropId] = useState(""); // inline confirm state

    const fetchStudentData = async () => {
        if (!activeStudent) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/students/${activeStudent}`);
            setStudentData(res.data);
        } catch (err) {
            console.error(err);
            onNotify("Failed to load your profile", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStudent, syncVersion]);

    const handleUnenroll = async (courseId) => {
        setDroppingCourseId(courseId);
        setConfirmDropId("");
        try {
            await api.delete(`/students/${activeStudent}/enroll/${courseId}`);
            onEnrollmentChange();
            onNotify("Course dropped successfully", "success");
            fetchStudentData();
        } catch (err) {
            onNotify(err.displayMessage || "Error dropping course", "error");
        } finally {
            setDroppingCourseId("");
        }
    };

    if (loading) return <div className="loader" />;

    if (!activeStudent) {
        return (
            <div
                className="animate-fade-in"
                style={{ textAlign: "center", marginTop: "6rem" }}
            >
                <LayoutDashboard
                    size={64}
                    style={{
                        color: "var(--primary)",
                        opacity: 0.5,
                        margin: "0 auto 1.5rem",
                        display: "block",
                    }}
                />
                <h2 className="heading-lg" style={{ fontSize: "1.8rem" }}>
                    Your Dashboard
                </h2>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "1.1rem",
                        maxWidth: "480px",
                        margin: "0 auto",
                    }}
                >
                    Select a student profile from the{" "}
                    <strong style={{ color: "var(--text-main)" }}>
                        Switch Account
                    </strong>{" "}
                    bar above.
                </p>
            </div>
        );
    }

    const enrolledCourses = studentData?.registeredCourses ?? [];
    const initials = studentData?.name?.charAt(0)?.toUpperCase() ?? "?";

    return (
        <div className="animate-fade-in">
            {/* Profile banner */}
            <div
                className="glass-panel"
                style={{
                    padding: "2rem",
                    marginBottom: "3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    background:
                        "linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(0,0,0,0.2))",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background:
                            "linear-gradient(135deg, var(--primary), #818cf8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                        boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                    }}
                >
                    {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                        className="heading-xl"
                        style={{ marginBottom: "0.2rem", fontSize: "2.2rem" }}
                    >
                        Hello, {studentData?.name ?? "Student"}
                    </h2>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "1rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {studentData?.email} &bull; Student Portal
                    </p>
                </div>
                <div
                    className="glass-panel"
                    style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "center",
                        flexShrink: 0,
                    }}
                >
                    <p
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            color: "var(--primary)",
                            lineHeight: 1,
                        }}
                    >
                        {enrolledCourses.length}
                    </p>
                    <p
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            marginTop: "0.2rem",
                        }}
                    >
                        Enrolled
                    </p>
                </div>
            </div>

            <h3
                className="heading-lg"
                style={{
                    fontSize: "1.6rem",
                    borderBottom: "1px solid var(--card-border)",
                    paddingBottom: "1rem",
                }}
            >
                My Enrolled Courses
            </h3>

            {enrolledCourses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0" }}>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "1.1rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        You're not enrolled in any courses yet.
                    </p>
                    <a href="/" className="btn btn-primary">
                        Browse Course Catalog
                    </a>
                </div>
            ) : (
                <div className="grid-container" style={{ marginTop: "1.5rem" }}>
                    {enrolledCourses.map((course) => {
                        const isDropping = droppingCourseId === course._id;
                        const isConfirming = confirmDropId === course._id;

                        return (
                            <div
                                key={course._id}
                                className="card glass-panel"
                                style={{
                                    borderLeft: "4px solid var(--success)",
                                    cursor: "default",
                                }}
                            >
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
                                            marginTop: "0.5rem",
                                        }}
                                    >
                                        <GraduationCap size={16} />{" "}
                                        {course.instructor}
                                    </p>
                                </div>
                                <p className="card-content">
                                    {course.description}
                                </p>

                                <div style={{ marginTop: "auto" }}>
                                    {/* Inline confirm state */}
                                    {isConfirming ? (
                                        <div
                                            style={{
                                                background:
                                                    "rgba(239, 68, 68, 0.08)",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "10px",
                                                padding: "0.85rem",
                                            }}
                                        >
                                            <p
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    color: "#fca5a5",
                                                    fontSize: "0.875rem",
                                                    marginBottom: "0.75rem",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <AlertTriangle size={15} /> Drop
                                                this course? This can't be
                                                undone.
                                            </p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <button
                                                    className="btn"
                                                    style={{
                                                        flex: 1,
                                                        padding: "0.5rem",
                                                        fontSize: "0.875rem",
                                                    }}
                                                    onClick={() =>
                                                        setConfirmDropId("")
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{
                                                        flex: 1,
                                                        padding: "0.5rem",
                                                        fontSize: "0.875rem",
                                                    }}
                                                    onClick={() =>
                                                        handleUnenroll(
                                                            course._id,
                                                        )
                                                    }
                                                    disabled={isDropping}
                                                >
                                                    Yes, Drop
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                setConfirmDropId(course._id)
                                            }
                                            disabled={isDropping}
                                            style={{
                                                width: "100%",
                                                padding: "0.6rem",
                                            }}
                                        >
                                            {isDropping ? (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <span className="btn-spinner" />{" "}
                                                    Dropping...
                                                </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <BookX size={18} /> Drop
                                                    Course
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
