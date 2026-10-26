"use client";

import React, { useRef, useState, useEffect } from "react";
import { Wand2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface CircleToSelectCanvasProps {
  isActive: boolean;
  locale: "en" | "bn";
  onCompleteDrawing: (points: Point[]) => void;
  onCancel: () => void;
  onWheelZoom?: (delta: number) => void;
}

export const CircleToSelectCanvas: React.FC<CircleToSelectCanvasProps> = ({
  isActive,
  locale,
  onCompleteDrawing,
  onWheelZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [isActive]);

  // Non-passive wheel zoom (React's onWheel is passive by default in some browsers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (onWheelZoom) onWheelZoom(e.deltaY < 0 ? 1 : -1);
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, [isActive, onWheelZoom]);

  const drawTrace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = pointsRef.current;
    if (points.length < 2) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(
      points[0].x,
      points[0].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );
    gradient.addColorStop(0, "#10b981");
    gradient.addColorStop(0.5, "#06b6d4");
    gradient.addColorStop(1, "#8b5cf6");

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = gradient;
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }

    ctx.stroke();
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.fill();
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    setIsDrawing(true);
    pointsRef.current = [{ x, y }];
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse") return;
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    pointsRef.current.push({ x, y });
    drawTrace();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse") return;
    if (!isDrawing) return;
    setIsDrawing(false);
    if ((e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }

    const points = pointsRef.current;
    if (points.length > 5) {
      onCompleteDrawing(points);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    pointsRef.current = [];
  };

  if (!isActive) return null;

  return (
    <div
      className={`absolute inset-0 z-[1500] ${isDrawing ? "cursor-crosshair" : "cursor-grab"}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-auto"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-2 pointer-events-none">
          <Wand2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">
            {locale === "bn"
              ? "মাউস ছেড়ে দিন ক্ষেত্রফল অটো-ডিটেক্ট করতে..."
              : "Release mouse to auto-detect field area..."}
          </span>
        </div>
      )}
    </div>
  );
};
