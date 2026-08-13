import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AnalysisProvider } from "./context/AnalysisContext.jsx";
import Home from "./pages/Home.jsx";
import Analyze from "./pages/Analyze.jsx";
import Results from "./pages/Results.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <AnalysisProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#FFFFFF",
              color: "#0F172A",
              boxShadow:
                "0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
              border: "1px solid #F1F5F9",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: { iconTheme: { primary: "#16A34A", secondary: "#fff" } },
            error: { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
          }}
        />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AnalysisProvider>
  );
}
