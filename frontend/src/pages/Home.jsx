import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ScanEye,
  Sparkles,
  Gauge,
  BarChart3,
  ShieldCheck,
  Zap,
  ImageUp,
} from "lucide-react";

const FEATURES = [
  {
    icon: Gauge,
    title: "10-Point Quality Report",
    desc: "Resolution, noise, blur, sharpness, brightness, contrast, compression artifacts, and entropy — scored 0 to 100.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Enhancement",
    desc: "Real-ESRGAN super-resolution sharpens, denoises, and upscales your image automatically.",
  },
  {
    icon: BarChart3,
    title: "Visual Comparisons",
    desc: "Bar, radar, and line charts plus RGB histograms show exactly what improved and by how much.",
  },
  {
    icon: ShieldCheck,
    title: "Actionable Recommendations",
    desc: "Plain-language notes tell you exactly what's holding your image quality back.",
  },
];

const STEPS = [
  { label: "Upload", desc: "Drag and drop a PNG, JPG, or WEBP image up to 20MB." },
  { label: "Analyze", desc: "Our engine scores 10 quality dimensions in seconds." },
  { label: "Enhance", desc: "AI upscaling sharpens detail and reduces noise." },
  { label: "Compare", desc: "See before/after metrics, charts, and a download link." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="section-container relative pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-semibold mb-6 animate-fade-in">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Image Analysis
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.1] animate-fade-in"
              style={{ animationDelay: "80ms", opacity: 0 }}
            >
              Know your image quality.
              <br />
              <span className="text-accent">Down to the pixel.</span>
            </h1>
            <p
              className="mt-6 text-lg text-ink-500 max-w-xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: "160ms", opacity: 0 }}
            >
              Upload any image and get a complete quality report in seconds —
              then let AI enhance it and see the improvement, side by side.
            </p>
            <div
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in"
              style={{ animationDelay: "240ms", opacity: 0 }}
            >
              <Link to="/analyze" className="btn-primary px-6 py-3 text-[15px]">
                <ImageUp className="h-4.5 w-4.5" />
                Analyze an Image
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="btn-secondary px-6 py-3 text-[15px]">
                How it works
              </Link>
            </div>
          </div>

          {/* Floating preview card */}
          <div
            className="relative mt-16 max-w-4xl mx-auto animate-fade-in"
            style={{ animationDelay: "320ms", opacity: 0 }}
          >
            <div className="glass-card p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { label: "Overall Score", value: "92", suffix: "/100", color: "text-success" },
                  { label: "Sharpness", value: "88", suffix: "%", color: "text-accent-700" },
                  { label: "Noise Level", value: "94", suffix: "%", color: "text-success" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card-solid p-5 text-center">
                    <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-extrabold ${stat.color}`}>
                      {stat.value}
                      <span className="text-base font-semibold text-ink-500">{stat.suffix}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-ink-100/30">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-ink-900 tracking-tight">
              Everything you need to trust your images
            </h2>
            <p className="mt-3 text-ink-500">
              A complete diagnostic and enhancement pipeline, built for
              designers, photographers, and engineering teams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card-solid p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700 mb-4">
                  <f.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="text-[15px] font-semibold text-ink-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-ink-900 tracking-tight">How it works</h2>
            <p className="mt-3 text-ink-500">Four steps from upload to insight.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {STEPS.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold shadow-soft">
                    {i + 1}
                  </span>
                  <h3 className="text-[15px] font-semibold text-ink-900">{step.label}</h3>
                </div>
                <p className="text-sm text-ink-500 leading-relaxed pl-12">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="section-container">
          <div className="glass-card relative overflow-hidden px-8 py-14 text-center">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent-100/60 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-50 blur-3xl" />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent shadow-soft mb-5">
                <ScanEye className="h-6 w-6 text-white" strokeWidth={2} />
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                Ready to see your image's true quality?
              </h2>
              <p className="mt-3 text-ink-500 max-w-md mx-auto">
                It takes less than a minute. No account required.
              </p>
              <Link to="/analyze" className="btn-primary mt-7 px-6 py-3 text-[15px] inline-flex">
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
