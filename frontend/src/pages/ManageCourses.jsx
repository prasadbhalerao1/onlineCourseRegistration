import React, { useState, useEffect } from "react";
import api from "../api";
import { Trash2, Edit, PlusCircle } from "lucide-react";

const EMPTY_FORM = { title: "", description: "", instructor: "", capacity: "" };

const ManageCourses = ({ onNotify = () => {} }) => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
            const res = await api.get("/courses");
            setCourses(res.data);
        } catch (err) {
            onNotify(err.displayMessage || "Failed to load courses", "error");
        } finally {
            setLoadingCourses(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (field) => (e) =>
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/courses/${editingId}`, formData);
                onNotify("Course updated successfully ✓", "success");
            } else {
                await api.post("/courses", formData);
                onNotify("Course created successfully ✓", "success");
            }
            setFormData(EMPTY_FORM);
            setEditingId(null);
            fetchCourses();
        } catch (err) {
            onNotify(err.displayMessage || "Error saving course", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (course) => {
        setEditingId(course._id);
        setFormData({
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            capacity: course.capacity,
        });
        // Scroll form into view on mobile
        document
            .getElementById("manage-form")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this course? This cannot be undone.",
            )
        )
            return;
        try {
            await api.delete(`/courses/${id}`);
            onNotify("Course deleted", "success");
            fetchCourses();
        } catch (err) {
            onNotify(err.displayMessage || "Error deleting course", "error");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "2rem" }}>
                <h2 className="heading-xl" style={{ fontSize: "2.5rem" }}>
                    Admin Dashboard
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                    Create, update, or remove courses from the catalog.
                </p>
            </div>

            <div className="manage-grid">
                {/* Left: Form */}
                <div id="manage-form">
                    <h3 className="heading-lg" style={{ fontSize: "1.4rem" }}>
                        {editingId ? (
                            "✏️ Edit Course"
                        ) : (
                            <>
                                <PlusCircle
                                    size={18}
                                    style={{
                                        display: "inline",
                                        marginRight: "0.4rem",
                                        verticalAlign: "middle",
                                    }}
                                />
                                New Course
                            </>
                        )}
                    </h3>
                    <form
                        onSubmit={handleSubmit}
                        className="glass-panel"
                        style={{ padding: "2rem" }}
                    >
                        <div className="form-group">
                            <label htmlFor="mc-title">Course Title</label>
                            <input
                                id="mc-title"
                                type="text"
                                className="input-field"
                                required
                                placeholder="e.g. Full-Stack JavaScript"
                                value={formData.title}
                                onChange={handleChange("title")}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mc-description">Description</label>
                            <textarea
                                id="mc-description"
                                className="input-field"
                                required
                                rows="3"
                                placeholder="Briefly describe what students will learn..."
                                value={formData.description}
                                onChange={handleChange("description")}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mc-instructor">
                                Instructor Name
                            </label>
                            <input
                                id="mc-instructor"
                                type="text"
                                className="input-field"
                                required
                                placeholder="e.g. Dr. Sarah Khan"
                                value={formData.instructor}
                                onChange={handleChange("instructor")}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mc-capacity">
                                Capacity (max students)
                            </label>
                            <input
                                id="mc-capacity"
                                type="number"
                                className="input-field"
                                required
                                min="1"
                                placeholder="e.g. 40"
                                value={formData.capacity}
                                onChange={handleChange("capacity")}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                style={{ flex: "1 1 auto" }}
                            >
                                {submitting ? (
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <span className="btn-spinner" />{" "}
                                        {editingId
                                            ? "Updating..."
                                            : "Creating..."}
                                    </span>
                                ) : editingId ? (
                                    "Update Course"
                                ) : (
                                    "Create Course"
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleCancel}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right: Course List */}
                <div>
                    <h3 className="heading-lg" style={{ fontSize: "1.4rem" }}>
                        Existing Courses
                        {!loadingCourses && (
                            <span
                                style={{
                                    marginLeft: "0.6rem",
                                    fontSize: "0.9rem",
                                    color: "var(--text-muted)",
                                    fontWeight: 400,
                                }}
                            >
                                ({courses.length})
                            </span>
                        )}
                    </h3>

                    {loadingCourses ? (
                        <div className="manage-courses-list">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="glass-panel manage-course-item"
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            className="skeleton skeleton-line"
                                            style={{
                                                width: "60%",
                                                height: "16px",
                                                marginBottom: "8px",
                                            }}
                                        />
                                        <div
                                            className="skeleton skeleton-line skeleton-line--short"
                                            style={{ height: "12px" }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <div
                                            className="skeleton"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "6px",
                                            }}
                                        />
                                        <div
                                            className="skeleton"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "6px",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div
                            className="glass-panel"
                            style={{
                                padding: "3rem 2rem",
                                textAlign: "center",
                            }}
                        >
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "1rem",
                                }}
                            >
                                No courses found. Create one to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="manage-courses-list">
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    className={`glass-panel manage-course-item ${editingId === course._id ? "course-card--enrolled" : ""}`}
                                >
                                    <div className="manage-course-item__info">
                                        <h4
                                            style={{
                                                color: "var(--text-main)",
                                                fontSize: "1rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {course.title}
                                        </h4>
                                        <p
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "0.85rem",
                                                marginTop: "0.25rem",
                                            }}
                                        >
                                            {course.instructor} &bull;{" "}
                                            {course.enrolledCount}/
                                            {course.capacity} students
                                        </p>
                                    </div>
                                    <div className="manage-course-item__actions">
                                        <button
                                            className="icon-btn icon-btn--edit"
                                            onClick={() => handleEdit(course)}
                                            title="Edit course"
                                            aria-label={`Edit ${course.title}`}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--delete"
                                            onClick={() =>
                                                handleDelete(course._id)
                                            }
                                            title="Delete course"
                                            aria-label={`Delete ${course.title}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCourses;
