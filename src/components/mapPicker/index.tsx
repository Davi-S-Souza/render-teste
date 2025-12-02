"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

//tava dabndo erro se eu nao usasse isso
//tens que dar uma olhada @caio
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
};

function LocationMarker({ onLocationSelect, initialPosition }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition: [number, number];
}) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  const map = useMap();

  useEffect(() => {
    setPosition(initialPosition);
    try {
      map.setView(initialPosition, map.getZoom());
    } catch (e) {
    }
  }, [initialPosition, map]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationSelect, initialLat = -27.5969, initialLng = -48.5495 }: Props) {
  const initialPosition: [number, number] = [initialLat, initialLng];

  return (
    <MapContainer
      center={initialPosition}
      zoom={14}
      style={{ height: "300px", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
    </MapContainer>
  );
}
