import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const EnrollmentModal = ({
    isOpen,
    course,
    requiresRegistration,
    onClose,
    onSubmit,
    isSubmitting,
    errorMessage,
}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1); // 1 = fill details, 2 = confirm
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Reset when modal OPENS
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setName("");
            setEmail("");
            setStep(requiresRegistration ? 1 : 2);
        }
    }

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape" && !isSubmitting) onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, isSubmitting, onClose]);

    const handleClose = useCallback(() => {
        if (!isSubmitting) onClose();
    }, [isSubmitting, onClose]);

    if (!isOpen || !course) return null;

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleConfirm = async () => {
        await onSubmit({ name: name.trim(), email: email.trim() });
    };

    const isFull = course.enrolledCount >= course.capacity;
    const seatsLeft = course.capacity - course.enrolledCount;

    return (
        <div
            className="modal-backdrop"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label="Course enrollment"
        >
            <div
                className="modal-panel glass-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div>
                        <span
                            className="badge badge-success"
                            style={{
                                marginBottom: "0.5rem",
                                display: "inline-block",
                            }}
                        >
                            {requiresRegistration
                                ? step === 1
                                    ? "Step 1 of 2"
                                    : "Step 2 of 2"
                                : "Confirm Enrollment"}
                        </span>
                        <h3
                            className="heading-lg"
                            style={{ marginBottom: 0, fontSize: "1.4rem" }}
                        >
                            {requiresRegistration && step === 1
                                ? "Create Your Account"
                                : "Confirm Enrollment"}
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        aria-label="Close enrollment modal"
                        style={{
                            background: "none",
                            border: "1px solid var(--card-border)",
                            color: "var(--text-muted)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            opacity: isSubmitting ? 0.4 : 1,
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Course Summary Card */}
                <div
                    className="glass-panel"
                    style={{
                        padding: "1rem 1.25rem",
                        marginBottom: "1.5rem",
                        background:
                            "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(0,0,0,0.2))",
                        borderColor: "rgba(99,102,241,0.25)",
                    }}
                >
                    <p
                        style={{
                            fontWeight: 600,
                            color: "var(--text-main)",
                            marginBottom: "0.3rem",
                            fontSize: "1rem",
                        }}
                    >
                        {course.title}
                    </p>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.875rem",
                            marginBottom: "0.3rem",
                        }}
                    >
                        👨‍🏫 {course.instructor}
                    </p>
                    <p
                        style={{
                            color:
                                seatsLeft <= 3
                                    ? "#fbbf24"
                                    : "var(--text-muted)",
                            fontSize: "0.875rem",
                        }}
                    >
                        🪑 {course.enrolledCount} / {course.capacity} seats
                        taken
                        {seatsLeft > 0 && (
                            <span
                                style={{
                                    color: "#6ee7b7",
                                    marginLeft: "0.5rem",
                                }}
                            >
                                ({seatsLeft} left)
                            </span>
                        )}
                    </p>
                </div>

                {/* Step 1: Details form (only when requiresRegistration) */}
                {requiresRegistration && step === 1 && (
                    <form onSubmit={handleDetailsSubmit}>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                marginBottom: "1.25rem",
                                fontSize: "0.95rem",
                            }}
                        >
                            Enter your details to create a student profile and
                            register for this course.
                        </p>
                        <div
                            className="form-group"
                            style={{ marginBottom: "1rem" }}
                        >
                            <label htmlFor="enroll-name">Full Name</label>
                            <input
                                id="enroll-name"
                                type="text"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g. Jane Doe"
                                autoFocus
                            />
                        </div>
                        <div
                            className="form-group"
                            style={{ marginBottom: "1.25rem" }}
                        >
                            <label htmlFor="enroll-email">Email Address</label>
                            <input
                                id="enroll-email"
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        {errorMessage && (
                            <p className="modal-error">{errorMessage}</p>
                        )}
                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                type="button"
                                className="btn"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Continue →
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Confirmation */}
                {step === 2 && (
                    <div>
                        {requiresRegistration && (
                            <div
                                className="glass-panel"
                                style={{
                                    padding: "0.85rem 1rem",
                                    marginBottom: "1.25rem",
                                    fontSize: "0.9rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Registering as:{" "}
                                <strong style={{ color: "var(--text-main)" }}>
                                    {name}
                                </strong>{" "}
                                ({email})
                            </div>
                        )}
                        <p
                            style={{
                                color: "var(--text-muted)",
                                marginBottom: "1.25rem",
                                fontSize: "0.95rem",
                            }}
                        >
                            You're about to enroll in{" "}
                            <strong style={{ color: "var(--text-main)" }}>
                                {course.title}
                            </strong>
                            . This will reserve your seat.
                        </p>
                        {errorMessage && (
                            <p className="modal-error">{errorMessage}</p>
                        )}
                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                justifyContent: "flex-end",
                            }}
                        >
                            {requiresRegistration && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setStep(1)}
                                    disabled={isSubmitting}
                                >
                                    ← Back
                                </button>
                            )}
                            {!requiresRegistration && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                disabled={isSubmitting || isFull}
                            >
                                {isSubmitting ? (
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <span className="btn-spinner" />{" "}
                                        Enrolling...
                                    </span>
                                ) : (
                                    "Confirm Enrollment"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnrollmentModal;
