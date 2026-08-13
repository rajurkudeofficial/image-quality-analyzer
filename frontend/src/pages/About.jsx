import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Github,
  Gauge,
  Waves,
  Focus,
  Sun,
  Contrast,
  Grid3x3,
  Binary,
} from "lucide-react";

const METRICS_INFO = [
  { icon: Focus, name: "Blur", desc: "Variance of the Laplacian — lower values mean fewer sharp edges and a blurrier image." },
  { icon: Sparkles, name: "Sharpness", desc: "Mean Sobel gradient magnitude across the image, capturing overall edge energy." },
  { icon: Waves, name: "Noise", desc: "Estimated via Immerkaer's method, a fast Laplacian-based noise-sigma estimator." },
  { icon: Sun, name: "Brightness", desc: "Average pixel intensity from the HSV value channel." },
  { icon: Contrast, name: "Contrast", desc: "Standard deviation of grayscale pixel intensities." },
  { icon: Grid3x3, name: "Compression Artifacts", desc: "Blockiness measured by comparing pixel discontinuity across 8×8 JPEG grid boundaries." },
  { icon: Binary, name: "Entropy", desc: "Shannon entropy of the grayscale image — a proxy for information content and texture." },
  { icon: Gauge, name: "Overall Score", desc: "A weighted blend of all normalized sub-scores, combined into a single 0–100 rating." },
];

const STACK = [
  { group: "Frontend", items: ["React 18", "Vite", "Tailwind CSS", "Recharts", "Framer Motion"] },
  { group: "Backend", items: ["FastAPI", "OpenCV", "NumPy", "scikit-image", "Pillow"] },
  { group: "AI Enhancement", items: ["Real-ESRGAN", "PyTorch", "Classical CV fallback pipeline"] },
];

export default function About() {
  return (
    <div className="section-container py-14 lg:py-20">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900">
          How the analysis works
        </h1>
        <p className="mt-3 text-ink-500">
          Every metric is grounded in a well-established computer-vision
          formula — not a black box.
        </p>
      </div>

      {/* Metrics explained */}
      <section className="mb-20">
        <h2 className="text-xl font-bold text-ink-900 mb-6">The quality metrics</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {METRICS_INFO.map((m) => (
            <div key={m.name} className="glass-card-solid p-5 flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <m.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-ink-900 mb-1">{m.name}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhancement explainer */}
      <section className="mb-20">
        <div className="glass-card-solid p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
              <Cpu className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-xl font-bold text-ink-900">The enhancement engine</h2>
          </div>
          <p className="text-ink-700 leading-relaxed mb-4">
            When you analyze an image, it's automatically enhanced using
            Real-ESRGAN — a deep-learning super-resolution model that
            upscales images while restoring realistic detail and reducing
            noise. If Real-ESRGAN's runtime isn't available (for example, no
            GPU or model weights present), the system falls back to a
            classical OpenCV pipeline: Lanczos upscaling, edge-preserving
            denoising, unsharp masking, and adaptive contrast enhancement —
            so the product always produces a real, improved result.
          </p>
          <p className="text-ink-700 leading-relaxed">
            Both the original and enhanced images are then scored using the
            same analysis engine, and the percentage change per metric is
            calculated to show exactly what improved.
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-20">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
            <Layers className="h-4.5 w-4.5" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Built with</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {STACK.map((s) => (
            <div key={s.group} className="glass-card-solid p-6">
              <h3 className="text-sm font-semibold text-accent-700 uppercase tracking-wide mb-3">
                {s.group}
              </h3>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-ink-700 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-ink-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link to="/analyze" className="btn-primary px-6 py-3 text-[15px] inline-flex">
          Try it now <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="https://github.com/rajurkudeofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-6 py-3 text-[15px] inline-flex ml-3"
        >
          <Github className="h-4 w-4" />
          View Source
        </a>
      </section>
    </div>
  );
}
