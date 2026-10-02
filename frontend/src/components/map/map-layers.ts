import L from "leaflet";

export const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; Earthstar Geographics, Maxar",
    maxZoom: 19,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  terrain: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 19,
  },
};

export function createPulsingCentroidIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-field-pin",
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-6 h-6 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
        <span class="relative w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
