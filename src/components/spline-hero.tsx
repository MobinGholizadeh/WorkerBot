import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineHero() {
  return (
    <div className="absolute inset-0 pointer-events-auto">
      <ClientOnly fallback={<div className="w-full h-full" />}>
        <Suspense fallback={<div className="w-full h-full" />}>
          <Spline scene="https://prod.spline.design/L2rd6Ufj8zBx53DU/scene.splinecode" />
          {/* Cover the "Built with Spline" watermark */}
          <div className="absolute bottom-0 right-0 w-[180px] h-[60px] bg-background z-10" />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
