"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FarmFieldInput } from "@/lib/schemas";
import { computeCentroidFromPolygon } from "@/lib/geo-utils";
import { Satellite, Map as MapIcon } from "lucide-react";

const LeafletFieldMap = dynamic(
  () => import("@/components/map/LeafletFieldMap").then((m) => m.LeafletFieldMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-900" /> }
);

interface Props {
  fieldInput: FarmFieldInput;
  onChangeField: (u: Partial<FarmFieldInput>) => void;
  locale: "en" | "bn";
  isGenerating?: boolean;
}

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

export const MapOnlyField: React.FC<Props> = ({ fieldInput, onChangeField, locale, isGenerating }) => {
  const [mapMode, setMapMode] = useState<"satellite" | "streets">("satellite");
  const [zoom, setZoom] = useState(15);
  const coords = fieldInput.polygon.coordinates[0] || [];
  const centerLat = fieldInput.centerCoordinates.lat;
  const centerLng = fieldInput.centerCoordinates.lng;

  const handlePolygonChange = (newCoords: Array<[number, number]>, newArea: number) => {
    const c = computeCentroidFromPolygon(newCoords);
    onChangeField({
      polygon: { type: "Polygon", coordinates: [newCoords] },
      areaHectares: newArea,
      centerCoordinates: { lat: c.lat, lng: c.lng },
    });
  };

  const handleZoomBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = 1 - y / rect.height;
    const z = Math.round(MIN_ZOOM + ratio * (MAX_ZOOM - MIN_ZOOM));
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)));
  };

  const fillPercent = ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-slate-200">
      <LeafletFieldMap
        centerLat={centerLat}
        centerLng={centerLng}
        coordinates={coords}
        fieldName={fieldInput.name}
        isEditMode={false}
        shapeMode="draw_circle"
        radiusMeters={70}
        mapMode={mapMode}
        zoom={zoom}
        locale={locale}
        className="h-full"
        onPolygonChange={handlePolygonChange}
        onCenterChange={(lat, lng) => onChangeField({ centerCoordinates: { lat, lng } })}
        onZoomChange={setZoom}
      />
      <div className="absolute top-3 left-3 z-[2000] px-3 py-2 rounded-xl bg-white/90 backdrop-blur text-xs font-bold text-slate-800 shadow pointer-events-none">
        {locale === "bn" ? "আপনার জমি গোল করুন" : "Circle your land"}
      </div>
      <div className="absolute top-3 right-3 z-[2000] flex gap-1 pointer-events-auto">
        <button
          onClick={() => setMapMode("satellite")}
          className={`p-2 rounded-lg shadow ${mapMode === "satellite" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}
          aria-label="Satellite"
        >
          <Satellite className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapMode("streets")}
          className={`p-2 rounded-lg shadow ${mapMode === "streets" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}
          aria-label="Streets"
        >
          <MapIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical zoom bar */}
      <div className="absolute bottom-4 right-4 z-[2000] flex flex-col items-center gap-1 pointer-events-auto">
        <div
          onClick={handleZoomBarClick}
          className="relative w-2 h-32 bg-slate-300/80 rounded-full cursor-pointer overflow-hidden"
        >
          <div
            className="absolute bottom-0 left-0 w-full bg-emerald-600 rounded-full"
            style={{ height: `${fillPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/80 px-1 rounded">
          {zoom}
        </span>
      </div>

      {isGenerating && (
        <>
          <style>{`
            @keyframes mapSheen {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .map-sheen-overlay {
              position: absolute;
              inset: 0;
              z-index: 1900;
              pointer-events: none;
              overflow: hidden;
            }
            .map-sheen-overlay::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 40%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
              animation: mapSheen 1.6s ease-in-out infinite;
            }
          `}</style>
          <div className="map-sheen-overlay" aria-hidden="true" />
        </>
      )}
    </div>
  );
};
