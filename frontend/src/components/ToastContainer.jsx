import React from "react";

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="toast-container" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span>{toast.message}</span>
                    <button
                        type="button"
                        onClick={() => onRemove(toast.id)}
                        className="toast-close"
                        aria-label="Close notification"
                    >
                        x
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
