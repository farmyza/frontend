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
}

export const CircleToSelectCanvas: React.FC<CircleToSelectCanvasProps> = ({
  isActive,
  locale,
  onCompleteDrawing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<Point[]>([]);

  // Synchronize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, [isActive]);

  const drawTrace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = pointsRef.current;
    if (points.length < 2) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Glowing Laser Ribbon Gradient (Google Circle-to-Search Signature Glow)
    const gradient = ctx.createLinearGradient(
      points[0].x,
      points[0].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );
    gradient.addColorStop(0, "#10b981"); // Emerald
    gradient.addColorStop(0.5, "#06b6d4"); // Cyan
    gradient.addColorStop(1, "#8b5cf6"); // Violet

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

    // Subtle glowing fill
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.fill();
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    pointsRef.current = [{ x, y }];
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current.push({ x, y });
    drawTrace();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if ((e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }

    const points = pointsRef.current;
    if (points.length > 5) {
      onCompleteDrawing(points);
    }

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    pointsRef.current = [];
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-[1500] cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Google-style Drawing HUD Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-2 pointer-events-none animate-bounce">
        <Wand2 className="w-4 h-4 text-emerald-400 animate-spin" />
        <span className="text-xs font-bold text-emerald-300">
          {isDrawing
            ? locale === "bn"
              ? "মাউস ছেড়ে দিন ক্ষেত্রফল অটো-ডিটেক্ট করতে..."
              : "Release mouse to auto-detect field area..."
            : locale === "bn"
            ? "মাউস দিয়ে যে কোনো জমির চারপাশে গোল করে বৃত্ত আঁকুন"
            : "Draw a circle around any farm plot with your mouse"}
        </span>
      </div>
    </div>
  );
};
