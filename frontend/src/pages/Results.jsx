import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RotateCcw,
  Zap,
  BarChart3,
  Radar as RadarIcon,
  TrendingUp,
  PieChart,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import ImageCompareCard from "../components/ImageCompareCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import QualityGauge from "../components/QualityGauge.jsx";
import ResultsSkeleton from "../components/skeletons/ResultsSkeleton.jsx";
import ComparisonBarChart from "../components/charts/ComparisonBarChart.jsx";
import QualityRadarChart from "../components/charts/QualityRadarChart.jsx";
import ImprovementLineChart from "../components/charts/ImprovementLineChart.jsx";
import RgbHistogramChart from "../components/charts/RgbHistogramChart.jsx";
import { METRIC_ICONS } from "../utils/metricIcons.js";
import { METRIC_LABELS } from "../utils/format.js";

const METRIC_ORDER = ["sharpness", "blur", "noise", "brightness", "contrast", "compression", "entropy"];

export default function Results() {
  const navigate = useNavigate();
  const { result, status, previewUrl, file, reset } = useAnalysis();

  useEffect(() => {
    if (status === "idle" && !result) {
      navigate("/analyze");
    }
  }, [status, result, navigate]);

  if (!result) {
    return (
      <div className="section-container py-14">
        <ResultsSkeleton />
      </div>
    );
  }

  const { original, enhanced, improvement_percentages: improvement, enhanced_image_url, backend_used } = result;

  const handleStartOver = () => {
    reset();
    navigate("/analyze");
  };

  return (
    <div className="section-container py-14 lg:py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-semibold mb-3">
            <Zap className="h-3.5 w-3.5" />
            {backend_used === "realesrgan" ? "Enhanced with Real-ESRGAN" : "Enhanced with classical AI pipeline"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900">
            Quality Report
          </h1>
          <p className="text-ink-500 mt-1.5">{result.filename}</p>
        </div>
        <button onClick={handleStartOver} className="btn-secondary shrink-0">
          <RotateCcw className="h-4 w-4" />
          Analyze Another
        </button>
      </div>

      {/* Image comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        <ImageCompareCard
          label="Original"
          imageUrl={previewUrl}
          fileSize={original.file_info.size_bytes}
          width={original.resolution.width}
          height={original.resolution.height}
          format={original.file_info.format}
        />
        <ImageCompareCard
          label="Enhanced"
          accentBadge="AI Enhanced"
          imageUrl={enhanced_image_url}
          fileSize={enhanced.file_info.size_bytes}
          width={enhanced.resolution.width}
          height={enhanced.resolution.height}
          format={enhanced.file_info.format}
          downloadable
          downloadFilename={`enhanced-${file?.name || "image"}.png`}
        />
      </div>

      {/* Gauges */}
      <section className="mb-14">
        <div className="glass-card-solid p-8 sm:p-10">
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
                Original Quality
              </p>
              <QualityGauge score={original.overall_score} />
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
                Enhanced Quality
              </p>
              <QualityGauge score={enhanced.overall_score} />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-ink-100 text-center">
            <p className="text-sm text-ink-500">
              Overall score changed by{" "}
              <span
                className={`font-bold ${
                  improvement.overall_score >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {improvement.overall_score >= 0 ? "+" : ""}
                {improvement.overall_score}%
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <Lightbulb className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Recommendations</h2>
        </div>
        <div className="glass-card-solid p-6 grid sm:grid-cols-2 gap-3">
          {original.recommendations.map((note, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              {note}
            </div>
          ))}
        </div>
      </section>

      {/* Metric cards - original */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <PieChart className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Original Image Metrics</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {METRIC_ORDER.map((key, i) => (
            <MetricCard
              key={key}
              icon={METRIC_ICONS[key]}
              title={METRIC_LABELS[key]}
              normalized={original[key].normalized}
              status={original[key].status}
              rawLabel={`Raw value: ${original[key].raw}`}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      {/* Metric cards - enhanced */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <Sparkles className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Enhanced Image Metrics</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {METRIC_ORDER.map((key, i) => (
            <MetricCard
              key={key}
              icon={METRIC_ICONS[key]}
              title={METRIC_LABELS[key]}
              normalized={enhanced[key].normalized}
              status={enhanced[key].status}
              rawLabel={`Raw value: ${enhanced[key].raw}`}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Original vs Enhanced</h2>
        </div>
        <div className="glass-card-solid p-6">
          <ComparisonBarChart original={original} enhanced={enhanced} />
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <RadarIcon className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Quality Parameters</h2>
        </div>
        <div className="glass-card-solid p-6">
          <QualityRadarChart original={original} enhanced={enhanced} />
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <TrendingUp className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">Improvement by Metric</h2>
        </div>
        <div className="glass-card-solid p-6">
          <ImprovementLineChart improvementPercentages={improvement} />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold text-ink-900">RGB Histogram</h2>
        </div>
        <div className="glass-card-solid p-6">
          <RgbHistogramChart
            originalStats={original.color_statistics}
            enhancedStats={enhanced.color_statistics}
          />
        </div>
      </section>

      <div className="mt-16 text-center">
        <Link to="/analyze" onClick={reset} className="btn-primary px-6 py-3 text-[15px] inline-flex">
          <RotateCcw className="h-4 w-4" />
          Analyze Another Image
        </Link>
      </div>
    </div>
  );
}
