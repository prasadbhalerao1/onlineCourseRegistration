import React, { useEffect } from "react";
import { X, Users, GraduationCap, CheckCircle } from "lucide-react";

const CourseDetailModal = ({
    course,
    isEnrolled,
    isOpen,
    onClose,
    onEnrollClick,
}) => {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !course) return null;

    const isFull = course.enrolledCount >= course.capacity;
    const seatsLeft = course.capacity - course.enrolledCount;

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Course details: ${course.title}`}
        >
            <div
                className="course-detail-modal glass-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="course-detail-modal__header">
                    <div style={{ flex: 1 }}>
                        <span
                            className={`badge ${isEnrolled ? "badge-enrolled" : isFull ? "badge-full" : "badge-success"}`}
                        >
                            {isEnrolled
                                ? "✓ Enrolled"
                                : isFull
                                  ? "Full"
                                  : "Open"}
                        </span>
                        <h2 className="course-detail-modal__title">
                            {course.title}
                        </h2>
                    </div>
                    <button
                        className="drawer-close-btn"
                        onClick={onClose}
                        aria-label="Close course details"
                        style={{ flexShrink: 0 }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="course-detail-modal__body">
                    {/* Instructor */}
                    <div className="drawer-meta-row">
                        <GraduationCap
                            size={18}
                            style={{ color: "var(--primary)", flexShrink: 0 }}
                        />
                        <div>
                            <p className="drawer-meta-label">Instructor</p>
                            <p className="drawer-meta-value">
                                {course.instructor}
                            </p>
                        </div>
                    </div>

                    {/* Enrollment */}
                    <div className="drawer-meta-row">
                        <Users
                            size={18}
                            style={{
                                color:
                                    seatsLeft <= 3
                                        ? "#fbbf24"
                                        : "var(--success)",
                                flexShrink: 0,
                            }}
                        />
                        <div>
                            <p className="drawer-meta-label">Enrollment</p>
                            <p className="drawer-meta-value">
                                {course.enrolledCount} / {course.capacity}{" "}
                                students
                                {seatsLeft > 0 && !isEnrolled && (
                                    <span
                                        style={{
                                            marginLeft: "0.5rem",
                                            color: "#6ee7b7",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        ({seatsLeft} seat
                                        {seatsLeft !== 1 ? "s" : ""} left)
                                    </span>
                                )}
                                {seatsLeft <= 3 &&
                                    seatsLeft > 0 &&
                                    !isEnrolled && (
                                        <span
                                            style={{
                                                marginLeft: "0.5rem",
                                                color: "#fbbf24",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            ⚠ Filling fast
                                        </span>
                                    )}
                            </p>
                        </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="drawer-capacity-bar-track">
                        <div
                            className="drawer-capacity-bar-fill"
                            style={{
                                width: `${Math.min(100, (course.enrolledCount / course.capacity) * 100)}%`,
                                background: isFull
                                    ? "#ef4444"
                                    : seatsLeft <= 3
                                      ? "#f59e0b"
                                      : "linear-gradient(90deg, var(--primary), var(--success))",
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: "1.5rem" }}>
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "var(--text-main)",
                                marginBottom: "0.6rem",
                            }}
                        >
                            About this course
                        </h3>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                lineHeight: 1.7,
                                fontSize: "0.95rem",
                            }}
                        >
                            {course.description}
                        </p>
                    </div>

                    {/* What you'll get */}
                    <div style={{ marginTop: "1.5rem" }}>
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "var(--text-main)",
                                marginBottom: "0.6rem",
                            }}
                        >
                            What you'll get
                        </h3>
                        <ul
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.6rem",
                            }}
                        >
                            {[
                                "Certificate upon completion",
                                "Access to all course materials",
                                "Direct instructor support",
                                "Lifetime access to resources",
                            ].map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.6rem",
                                        color: "var(--text-muted)",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    <CheckCircle
                                        size={16}
                                        style={{
                                            color: "var(--success)",
                                            flexShrink: 0,
                                        }}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="course-detail-modal__footer">
                    {isEnrolled ? (
                        <div className="enrolled-confirmation">
                            <CheckCircle
                                size={20}
                                style={{ color: "var(--success)" }}
                            />
                            <span>You're enrolled in this course</span>
                        </div>
                    ) : isFull ? (
                        <button
                            className="btn"
                            disabled
                            style={{ width: "100%", opacity: 0.5 }}
                        >
                            Course is Full
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={onEnrollClick}
                            style={{
                                width: "100%",
                                padding: "0.85rem",
                                fontSize: "1rem",
                            }}
                        >
                            Enroll Now
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
