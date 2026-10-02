"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Sparkles } from "lucide-react";
import { FarmFieldInput } from "@/lib/schemas";
import {
  calculatePolygonAreaHectares,
  scalePolygon,
  createDefaultBoxCoordinates,
  createCirclePolygon,
  calculateCircleAreaHectares,
  estimateRadiusFromAreaHectares,
} from "@/lib/geo-utils";
import { CircleControls } from "@/components/map/CircleControls";
import { MapToolbar } from "@/components/map/MapToolbar";
import { MapFloatingControls } from "@/components/map/MapFloatingControls";

const LeafletFieldMap = dynamic(
  () => import("@/components/map/LeafletFieldMap").then((mod) => mod.LeafletFieldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 sm:h-96 bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-2">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Initializing Live Satellite Imagery...</span>
      </div>
    ),
  }
);

interface FieldMapProps {
  fieldInput: FarmFieldInput;
  onChangeField: (updated: Partial<FarmFieldInput>) => void;
  locale: "en" | "bn";
}

export const FieldMap: React.FC<FieldMapProps> = ({
  fieldInput,
  onChangeField,
  locale,
}) => {
  const [zoom, setZoom] = useState<number>(15);
  const [mapMode, setMapMode] = useState<"satellite" | "streets" | "terrain">("satellite");
  const [shapeMode, setShapeMode] = useState<"draw_circle" | "circle" | "polygon">("draw_circle");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [radiusMeters, setRadiusMeters] = useState<number>(() =>
    estimateRadiusFromAreaHectares(fieldInput.areaHectares || 1.45)
  );

  const coordinates = fieldInput.polygon.coordinates[0] || [];
  const centerLat = fieldInput.centerCoordinates.lat;
  const centerLng = fieldInput.centerCoordinates.lng;

  const calculatedAreaHectares = useMemo(() => {
    return calculatePolygonAreaHectares(coordinates, centerLat);
  }, [coordinates, centerLat]);

  const handlePolygonChange = (newCoords: Array<[number, number]>, newArea: number) => {
    onChangeField({
      polygon: {
        type: "Polygon",
        coordinates: [newCoords],
      },
      areaHectares: newArea,
    });
  };

  const handleCenterChange = (newLat: number, newLng: number) => {
    onChangeField({
      centerCoordinates: {
        lat: newLat,
        lng: newLng,
      },
    });
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusMeters(newRadius);
    const circleCoords = createCirclePolygon(centerLng, centerLat, newRadius);
    const circleArea = calculateCircleAreaHectares(newRadius);
    handlePolygonChange(circleCoords, circleArea);
  };

  const handleSwitchShapeMode = (newMode: "draw_circle" | "circle" | "polygon") => {
    setShapeMode(newMode);
    if (newMode === "circle") {
      const circleCoords = createCirclePolygon(centerLng, centerLat, radiusMeters);
      const circleArea = calculateCircleAreaHectares(radiusMeters);
      handlePolygonChange(circleCoords, circleArea);
    }
  };

  const handleScaleField = (multiplier: number) => {
    if (shapeMode === "circle") {
      const newRadius = Math.max(25, Math.min(400, Math.round(radiusMeters * multiplier)));
      handleRadiusChange(newRadius);
    } else {
      const scaled = scalePolygon(coordinates, centerLng, centerLat, multiplier);
      const newArea = calculatePolygonAreaHectares(scaled, centerLat);
      handlePolygonChange(scaled, newArea);
    }
  };

  const handleResetToBox = () => {
    if (shapeMode === "circle") {
      handleRadiusChange(70);
    } else {
      const boxCoords = createDefaultBoxCoordinates(centerLng, centerLat);
      const newArea = calculatePolygonAreaHectares(boxCoords, centerLat);
      handlePolygonChange(boxCoords, newArea);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <MapToolbar
        district={fieldInput.district}
        centerLat={centerLat}
        centerLng={centerLng}
        areaHectares={fieldInput.areaHectares}
        shapeMode={shapeMode}
        mapMode={mapMode}
        isEditMode={isEditMode}
        locale={locale}
        onSwitchShapeMode={handleSwitchShapeMode}
        onSwitchMapMode={setMapMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      <div className="relative">
        <LeafletFieldMap
          centerLat={centerLat}
          centerLng={centerLng}
          coordinates={coordinates}
          fieldName={fieldInput.name}
          isEditMode={isEditMode}
          shapeMode={shapeMode}
          radiusMeters={radiusMeters}
          mapMode={mapMode}
          zoom={zoom}
          locale={locale}
          onPolygonChange={handlePolygonChange}
          onCenterChange={handleCenterChange}
          onRadiusChange={setRadiusMeters}
        />

        <MapFloatingControls
          centerLat={centerLat}
          centerLng={centerLng}
          shapeMode={shapeMode}
          locale={locale}
          onZoomIn={() => setZoom((z) => Math.min(z + 1, 18))}
          onZoomOut={() => setZoom((z) => Math.max(z - 1, 12))}
          onResetShape={handleResetToBox}
          onScaleField={handleScaleField}
        />
      </div>

      {shapeMode === "circle" && (
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <CircleControls
            radiusMeters={radiusMeters}
            onChangeRadius={handleRadiusChange}
            locale={locale}
          />
        </div>
      )}

      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          {shapeMode === "draw_circle" ? (
            <>
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="font-medium text-slate-700">
                {locale === "bn"
                  ? "গুগল 'সার্কেল টু সার্চ' মোড সক্রিয়: মাউস বা আঙুল দিয়ে মানচিত্রে গোল দাগ দিয়ে জমি চিহ্নিত করুন।"
                  : "Circle to Select active: Draw a freehand circle around your field with your mouse to auto-detect area."}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {shapeMode === "circle"
                  ? locale === "bn"
                    ? "মানচিত্রে ক্লিক করে কেন্দ্র স্থাপন করুন অথবা বৃত্তের সবুজ প্রান্ত বিন্দু টেনে ক্ষেত্রফল নির্ধারণ করুন।"
                    : "Click anywhere on map to relocate spot, or drag the green circle rim handle to adjust area."
                  : locale === "bn"
                  ? "বহুভুজ সক্রিয় (NASA গ্রিড সেল কোঅর্ডিনেট যুক্ত)"
                  : "Custom polygon active (Aligned to NASA POWER 0.5° grid)"}
              </span>
            </>
          )}
        </div>
        <div className="font-mono text-slate-500 text-[11px] font-bold">
          {calculatedAreaHectares} ha ({(calculatedAreaHectares * 7.47).toFixed(1)} bigha)
        </div>
      </div>
    </div>
  );
};
