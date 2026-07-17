import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { StorageFacility } from "@/types";

const icon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.48 0.13 145);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25)"></div>`,
  iconSize: [28, 28], iconAnchor: [14, 28],
});

export default function StorageMap({ facilities, selectedId, onSelect }: { facilities?: StorageFacility[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const selectedIcon = L.divIcon({
    className: "",
    html: `<div style="background:var(--color-primary, oklch(0.62 0.17 146));width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 6px 16px rgba(0,0,0,.3)"></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32],
  });
  return (
    <MapContainer center={[22.7196, 75.8577]} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {facilities?.map(f => (
        <Marker 
          key={f.id} 
          position={[f.lat, f.lng]} 
          icon={selectedId === f.id ? selectedIcon : icon}
          eventHandlers={{
            click: () => onSelect(f.id)
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.distance_km} km · ₹{f.cost_per_kg_day}/kg/day</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
