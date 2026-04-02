import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, X, Menu } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => (location.pathname === path ? "active" : "");

    const navLinks = [
        { to: "/", label: "Browse Courses" },
        { to: "/dashboard", label: "My Dashboard" },
        { to: "/manage-courses", label: "⚙ Admin Manage" },
    ];

    const handleLinkClick = () => setMobileOpen(false);

    return (
        <>
            <nav
                className="navbar glass-panel"
                style={{
                    borderRadius: "0",
                    borderLeft: "none",
                    borderRight: "none",
                    borderTop: "none",
                }}
            >
                <div className="navbar__brand">
                    <BookOpen color="var(--primary)" size={32} />
                    <h1
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: "700",
                            color: "var(--text-main)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        EduConnect
                    </h1>
                </div>

                {/* Desktop nav */}
                <div className="nav-links">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`nav-link ${isActive(to)}`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Hamburger — mobile only */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation"
                    aria-expanded={mobileOpen}
                >
                    <Menu size={22} />
                </button>
            </nav>

            {/* Mobile overlay nav */}
            <div
                className={`nav-mobile ${mobileOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
            >
                <button
                    className="nav-mobile__close"
                    onClick={handleLinkClick}
                    aria-label="Close navigation"
                >
                    <X size={20} />
                </button>
                {navLinks.map(({ to, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`nav-link ${isActive(to)}`}
                        onClick={handleLinkClick}
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </>
    );
};

export default Navbar;
