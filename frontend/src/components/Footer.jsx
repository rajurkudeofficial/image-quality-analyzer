import React from "react";
import { Link } from "react-router-dom";
import { ScanEye, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="section-container py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <ScanEye className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-bold text-ink-900">
                Digital Image Quality Analyzer
              </span>
            </Link>
            <p className="text-sm text-ink-500 leading-relaxed">
              AI-powered image analysis and enhancement, built for teams who
              care about pixel-perfect quality.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wide mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-ink-500">
                <li><Link to="/analyze" className="hover:text-accent-700 transition-colors">Analyze Image</Link></li>
                <li><Link to="/about" className="hover:text-accent-700 transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wide mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-ink-500">
                <li><a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-accent-700 transition-colors">API Docs</a></li>
                <li><a href="https://github.com/rajurkudeofficial" target="_blank" rel="noopener noreferrer" className="hover:text-accent-700 transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wide mb-3">
                Connect
              </h4>
              <div className="flex gap-2">
                <a href="https://github.com/rajurkudeofficial" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-ink-500 hover:text-accent-700 hover:border-accent-200 transition-colors">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://twitter.com/rajurkude" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-ink-500 hover:text-accent-700 hover:border-accent-200 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com/in/rajurkudeofficial" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-ink-500 hover:text-accent-700 hover:border-accent-200 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Digital Image Quality Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-ink-500">Built with ❤️ by Raj Urkude</p>
        </div>
      </div>
    </footer>
  );
}
