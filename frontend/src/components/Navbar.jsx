import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { ScanEye, Github, Menu, X } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-ink-100"
          : "bg-white/50 backdrop-blur-md border-b border-transparent"
      )}
    >
      <div className="section-container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent shadow-soft transition-transform group-hover:scale-105">
            <ScanEye className="h-5 w-5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-ink-900">
            Digital Image Quality Analyzer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-accent-700 bg-accent-50"
                    : "text-ink-500 hover:text-ink-900 hover:bg-ink-100/60"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href="https://github.com/rajurkudeofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-ink-500 hover:text-ink-900 rounded-lg hover:bg-ink-100/60 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link to="/analyze" className="btn-primary ml-2">
            Get Started
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-ink-100/60 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white/95 backdrop-blur-xl animate-fade-in">
          <div className="section-container py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "text-accent-700 bg-accent-50" : "text-ink-700 hover:bg-ink-100/60"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="https://github.com/rajurkudeofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-sm font-medium text-ink-700 rounded-lg hover:bg-ink-100/60"
            >
              GitHub
            </a>
            <Link to="/analyze" className="btn-primary mt-2 mx-4" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
