"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import {
  calculatePolygonAreaHectares,
  createCirclePolygon,
  calculateCircleAreaHectares,
  simplifyDrawnPolygon,
  computeCentroidFromPolygon,
} from "@/lib/geo-utils";
import { TILE_LAYERS, createPulsingCentroidIcon } from "@/components/map/map-layers";
import { CircleToSelectCanvas } from "@/components/map/CircleToSelectCanvas";

interface LeafletFieldMapProps {
  centerLat: number;
  centerLng: number;
  coordinates: Array<[number, number]>;
  fieldName: string;
  isEditMode: boolean;
  shapeMode: "draw_circle" | "circle" | "polygon";
  radiusMeters: number;
  mapMode: "satellite" | "streets" | "terrain";
  zoom: number;
  locale: "en" | "bn";
  onPolygonChange: (newCoordinates: Array<[number, number]>, calculatedArea: number) => void;
  onCenterChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (newRadius: number) => void;
}

export const LeafletFieldMap: React.FC<LeafletFieldMapProps> = ({
  centerLat,
  centerLng,
  coordinates,
  fieldName,
  isEditMode,
  shapeMode,
  radiusMeters,
  mapMode,
  zoom,
  locale,
  onPolygonChange,
  onCenterChange,
  onRadiusChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const vertexMarkersRef = useRef<L.CircleMarker[]>([]);
  const radiusEdgeMarkerRef = useRef<L.CircleMarker | null>(null);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    const activeTileConfig = TILE_LAYERS[mapMode];
    tileLayerRef.current = L.tileLayer(activeTileConfig.url, {
      maxZoom: activeTileConfig.maxZoom,
      attribution: activeTileConfig.attribution,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const activeTileConfig = TILE_LAYERS[mapMode];
    tileLayerRef.current = L.tileLayer(activeTileConfig.url, {
      maxZoom: activeTileConfig.maxZoom,
      attribution: activeTileConfig.attribution,
    }).addTo(map);
  }, [mapMode]);

  // Smooth Camera Fly-To
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const currentCenter = map.getCenter();
    const dist = Math.hypot(currentCenter.lat - centerLat, currentCenter.lng - centerLng);
    if (dist > 0.0001 || map.getZoom() !== zoom) {
      map.flyTo([centerLat, centerLng], zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [centerLat, centerLng, zoom]);

  // Freehand Mouse Circle Draw Handler (Google Circle to Search Style)
  const handleCompleteFreehandDraw = (points: Array<{ x: number; y: number }>) => {
    const map = mapInstanceRef.current;
    if (!map || points.length < 5) return;

    const rawGeoCoords: Array<[number, number]> = points.map((p) => {
      const latLng = map.containerPointToLatLng(L.point(p.x, p.y));
      return [Number(latLng.lng.toFixed(5)), Number(latLng.lat.toFixed(5))];
    });

    const simplified = simplifyDrawnPolygon(rawGeoCoords, 28);
    const centroid = computeCentroidFromPolygon(simplified);
    const calculatedArea = calculatePolygonAreaHectares(simplified, centroid.lat);

    onPolygonChange(simplified, calculatedArea);
    onCenterChange?.(centroid.lat, centroid.lng);
  };

  // Sync Polygon Layer & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLngs: L.LatLngTuple[] = coordinates.map(([lng, lat]) => [lat, lng]);

    if (!polygonLayerRef.current) {
      polygonLayerRef.current = L.polygon(latLngs, {
        color: "#10b981",
        weight: 3,
        opacity: 0.95,
        fillColor: "#10b981",
        fillOpacity: 0.35,
        dashArray: isEditMode ? "6, 6" : undefined,
      }).addTo(map);
    } else {
      polygonLayerRef.current.setLatLngs(latLngs);
      polygonLayerRef.current.setStyle({
        dashArray: isEditMode ? "6, 6" : undefined,
      });
    }

    // Centroid Marker
    if (!centerMarkerRef.current) {
      const customIcon = createPulsingCentroidIcon();
      const marker = L.marker([centerLat, centerLng], { icon: customIcon }).addTo(map);
      marker.bindTooltip(
        `<div class="text-xs font-bold text-slate-800">${fieldName}</div>`,
        { permanent: false, direction: "top", offset: [0, -10] }
      );
      centerMarkerRef.current = marker;
    } else {
      centerMarkerRef.current.setLatLng([centerLat, centerLng]);
      centerMarkerRef.current.setTooltipContent(
        `<div class="text-xs font-bold text-slate-800">${fieldName}</div>`
      );
    }

    // Clean vertex / edge markers
    vertexMarkersRef.current.forEach((m) => map.removeLayer(m));
    vertexMarkersRef.current = [];
    if (radiusEdgeMarkerRef.current) {
      map.removeLayer(radiusEdgeMarkerRef.current);
      radiusEdgeMarkerRef.current = null;
    }

    // RADIUS CIRCLE MODE: Interactive Edge Handle
    if (shapeMode === "circle") {
      const latRad = (centerLat * Math.PI) / 180;
      const metersPerLng = 111320 * Math.cos(latRad);
      const edgeLng = centerLng + radiusMeters / metersPerLng;

      const edgeMarker = L.circleMarker([centerLat, edgeLng], {
        radius: 9,
        color: "#0f172a",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 1,
        className: "cursor-ew-resize",
      }).addTo(map);

      let isDraggingEdge = false;
      edgeMarker.on("mousedown", (e) => {
        L.DomEvent.stopPropagation(e);
        isDraggingEdge = true;
        map.dragging.disable();
      });

      const handleEdgeMove = (e: L.LeafletMouseEvent) => {
        if (!isDraggingEdge) return;
        const distMeters = map.distance([centerLat, centerLng], e.latlng);
        const clampedRadius = Math.max(25, Math.min(400, Math.round(distMeters)));
        onRadiusChange?.(clampedRadius);

        const circleCoords = createCirclePolygon(centerLng, centerLat, clampedRadius);
        const circleArea = calculateCircleAreaHectares(clampedRadius);
        onPolygonChange(circleCoords, circleArea);
      };

      const stopEdgeDrag = () => {
        if (!isDraggingEdge) return;
        isDraggingEdge = false;
        map.dragging.enable();
      };

      map.on("mousemove", handleEdgeMove);
      map.on("mouseup", stopEdgeDrag);
      edgeMarker.on("mouseup", stopEdgeDrag);
      radiusEdgeMarkerRef.current = edgeMarker;
    }

    // POLYGON MODE: Draggable Vertices
    if (shapeMode === "polygon" && isEditMode) {
      const handles: L.CircleMarker[] = [];
      const numVertices = coordinates.length - 1;

      coordinates.slice(0, numVertices).forEach(([lng, lat], index) => {
        const handle = L.circleMarker([lat, lng], {
          radius: 8,
          color: "#0f172a",
          weight: 2,
          fillColor: "#f59e0b",
          fillOpacity: 1,
          className: "cursor-grab",
        }).addTo(map);

        let isDragging = false;
        handle.on("mousedown", (e) => {
          L.DomEvent.stopPropagation(e);
          isDragging = true;
          map.dragging.disable();
        });

        map.on("mousemove", (e) => {
          if (!isDragging) return;
          handle.setLatLng(e.latlng);
          const updatedCoords = [...coordinates];
          const uLng = Number(e.latlng.lng.toFixed(5));
          const uLat = Number(e.latlng.lat.toFixed(5));
          updatedCoords[index] = [uLng, uLat];
          if (index === 0) updatedCoords[updatedCoords.length - 1] = [uLng, uLat];
          if (polygonLayerRef.current) {
            polygonLayerRef.current.setLatLngs(updatedCoords.map(([cLng, cLat]) => [cLat, cLng]));
          }
        });

        const stopDragging = () => {
          if (!isDragging) return;
          isDragging = false;
          map.dragging.enable();
          const finalLatLng = handle.getLatLng();
          const updatedCoords = [...coordinates];
          const uLng = Number(finalLatLng.lng.toFixed(5));
          const uLat = Number(finalLatLng.lat.toFixed(5));
          updatedCoords[index] = [uLng, uLat];
          if (index === 0) updatedCoords[updatedCoords.length - 1] = [uLng, uLat];
          const calculatedArea = calculatePolygonAreaHectares(updatedCoords, centerLat);
          onPolygonChange(updatedCoords, calculatedArea);
        };

        map.on("mouseup", stopDragging);
        handle.on("mouseup", stopDragging);
        handles.push(handle);
      });

      vertexMarkersRef.current = handles;
    }
  }, [coordinates, centerLat, centerLng, isEditMode, shapeMode, radiusMeters, fieldName]);

  return (
    <div className="relative w-full h-80 sm:h-96 overflow-hidden rounded-b-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <CircleToSelectCanvas
        isActive={shapeMode === "draw_circle"}
        locale={locale}
        onCompleteDrawing={handleCompleteFreehandDraw}
        onCancel={() => {}}
      />
    </div>
  );
};
