import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import CourseList from "./pages/CourseList";
import ManageCourses from "./pages/ManageCourses";
import StudentDashboard from "./pages/StudentDashboard";
import api from "./api";
import { ChevronDown, ChevronUp, UserCircle2, WifiOff } from "lucide-react";
import "./App.css";

const STUDENT_STORAGE_KEY = "educonnect_student_id";

function App() {
    const [students, setStudents] = useState([]);
    const [activeStudent, setActiveStudent] = useState("");
    const [syncVersion, setSyncVersion] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [showSelector, setShowSelector] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // --- Toast helpers ---
    const showToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((toastId) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, []);

    const notifyEnrollmentChange = useCallback(() => {
        setSyncVersion((prev) => prev + 1);
    }, []);

    // --- Student selection with localStorage ---
    const handleSetActiveStudent = useCallback((id) => {
        setActiveStudent(id);
        if (id) {
            localStorage.setItem(STUDENT_STORAGE_KEY, id);
        } else {
            localStorage.removeItem(STUDENT_STORAGE_KEY);
        }
    }, []);

    // --- Backend health check ---
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch("/health");
                setIsOffline(!res.ok);
            } catch {
                setIsOffline(true);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    // --- Fetch students ---
    const fetchStudents = useCallback(async () => {
        try {
            const res = await api.get("/students");
            setStudents(res.data);

            const storedId = localStorage.getItem(STUDENT_STORAGE_KEY);
            if (storedId && res.data.some((s) => s._id === storedId)) {
                setActiveStudent(storedId);
            } else if (storedId) {
                localStorage.removeItem(STUDENT_STORAGE_KEY);
            }
        } catch (error) {
            console.error(
                "Error fetching students (is backend running?):",
                error,
            );
        }
    }, []);

    // --- Create student (called from CourseList enrollment flow) ---
    const createStudent = useCallback(
        async (name, email) => {
            const res = await api.post("/students", { name, email });
            const created = res.data;
            setStudents((prev) => [...prev, created]);
            handleSetActiveStudent(created._id);
            return created;
        },
        [handleSetActiveStudent],
    );

    useEffect(() => {
        const init = async () => {
            await fetchStudents();
        };
        init();
    }, [fetchStudents]);

    const activeStudentObj = students.find((s) => s._id === activeStudent);

    return (
        <Router>
            <Navbar />
            <div className="page-container animate-fade-in">
                {/* Offline Banner */}
                {isOffline && (
                    <div className="offline-banner" role="alert">
                        <span className="offline-banner__dot" />
                        <WifiOff size={16} style={{ flexShrink: 0 }} />
                        <span>
                            Backend offline — make sure the server is running on
                            port 5000
                        </span>
                    </div>
                )}

                {/* Student Identity Bar */}
                <div className="identity-bar glass-panel">
                    <div className="identity-bar__left">
                        <UserCircle2
                            size={22}
                            style={{ color: "var(--primary)", flexShrink: 0 }}
                        />
                        {activeStudentObj ? (
                            <div className="identity-bar__info">
                                <span className="identity-bar__name">
                                    {activeStudentObj.name}
                                </span>
                                <span className="identity-bar__email">
                                    {activeStudentObj.email}
                                </span>
                            </div>
                        ) : (
                            <span className="identity-bar__guest">
                                No session — enroll in a course to register
                            </span>
                        )}
                    </div>

                    <button
                        className="identity-bar__toggle"
                        onClick={() => setShowSelector((v) => !v)}
                        aria-expanded={showSelector}
                    >
                        Switch Account{" "}
                        {showSelector ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </button>
                </div>

                {/* Collapsible Student Selector */}
                {showSelector && (
                    <div className="selector-panel glass-panel animate-fade-in">
                        <label
                            htmlFor="student-select"
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.875rem",
                                display: "block",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Switch to a different student profile:
                        </label>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <select
                                id="student-select"
                                value={activeStudent}
                                onChange={(e) => {
                                    handleSetActiveStudent(e.target.value);
                                    setShowSelector(false);
                                }}
                                style={{ flex: "1 1 240px" }}
                                className="input-field"
                            >
                                <option value="">
                                    -- Guest (no account) --
                                </option>
                                {students.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.email})
                                    </option>
                                ))}
                            </select>
                            {activeStudent && (
                                <button
                                    className="btn btn-danger"
                                    style={{
                                        padding: "0.5rem 1rem",
                                        fontSize: "0.875rem",
                                    }}
                                    onClick={() => {
                                        handleSetActiveStudent("");
                                        setShowSelector(false);
                                    }}
                                >
                                    Sign Out
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <Routes>
                    <Route
                        path="/"
                        element={
                            <CourseList
                                activeStudent={activeStudent}
                                syncVersion={syncVersion}
                                onEnrollmentChange={notifyEnrollmentChange}
                                onCreateStudent={createStudent}
                                onStudentRestored={handleSetActiveStudent}
                                onNotify={showToast}
                            />
                        }
                    />
                    <Route
                        path="/manage-courses"
                        element={<ManageCourses onNotify={showToast} />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <StudentDashboard
                                activeStudent={activeStudent}
                                syncVersion={syncVersion}
                                onEnrollmentChange={notifyEnrollmentChange}
                                onNotify={showToast}
                            />
                        }
                    />
                </Routes>
            </div>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </Router>
    );
}

export default App;
