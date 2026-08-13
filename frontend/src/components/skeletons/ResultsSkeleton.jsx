import React from "react";

export function MetricCardSkeleton() {
  return (
    <div className="glass-card-solid p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-3 w-24 rounded mb-2" />
      <div className="skeleton h-6 w-16 rounded mb-3" />
      <div className="skeleton h-2 w-full rounded-full" />
    </div>
  );
}

export function ImageCardSkeleton() {
  return (
    <div className="glass-card-solid p-4">
      <div className="skeleton h-64 w-full rounded-xl mb-3" />
      <div className="skeleton h-4 w-32 rounded" />
    </div>
  );
}

export function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton h-[220px] w-[220px] rounded-full" />
    </div>
  );
}

export function ChartSkeleton({ height = 320 }) {
  return <div className="skeleton w-full rounded-xl" style={{ height }} />;
}

export default function ResultsSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        <ImageCardSkeleton />
        <ImageCardSkeleton />
      </div>
      <div className="flex justify-center">
        <GaugeSkeleton />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
