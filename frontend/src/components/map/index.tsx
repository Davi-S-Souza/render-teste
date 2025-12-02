"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import type { MapMarker, MarkerCategory } from "../mapView";
import { getImageUrl } from "@/lib/config";
import { ImageViewer } from "@/components/imageViewer";

// Fix para ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ícones customizados por cor
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">!</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

type Props = {
  markers: MapMarker[];
  focusPosition?: [number, number];
  categories?: Array<{ id: number; name: string; color: string }>;
};

function SetViewOnMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

// centraliza o mapa pra pos
function SetViewOnFocus({ focusPosition }: { focusPosition?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (focusPosition) {
      map.setView(focusPosition, 15);
    }
  }, [focusPosition, map]);

  return null;
}

function MapLegend({ categories }: { categories: Array<{ id: number; name: string; color: string }> }) {
  const map = useMap();

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      
      // estilo da legenda
      Object.assign(div.style, {
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '2px solid #e5e7eb',
        maxWidth: '200px'
      });

      // titulo
      const title = document.createElement('h4');
      Object.assign(title.style, {
        fontWeight: '600',
        fontSize: '14px',
        color: '#111827',
        margin: '0 0 8px 0'
      });
      title.textContent = 'Categorias';
      div.appendChild(title);

      // itens
      categories.forEach((cat) => {
        const item = document.createElement('div');
        Object.assign(item.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px'
        });

        const colorBox = document.createElement('div');
        Object.assign(colorBox.style, {
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: cat.color,
          border: '2px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          flexShrink: '0'
        });

        const label = document.createElement('span');
        Object.assign(label.style, {
          fontSize: '12px',
          color: '#374151'
        });
        label.textContent = cat.name;

        item.appendChild(colorBox);
        item.appendChild(label);
        div.appendChild(item);
      });

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, categories]);

  return null;
}

export default function Map({ markers, focusPosition, categories = [] }: Props) {
  const defaultCenter: [number, number] = [-27.5969, -48.5495];
  const router = useRouter();

  return (
    <MapContainer
      center={defaultCenter}
      zoom={14}
      style={{ height: "600px", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={createCustomIcon(marker.categoryColor)}
        >
          <Popup maxWidth={300}>
            <div 
              className="p-2 cursor-pointer hover:bg-gray-50 transition-colors rounded"
              onClick={() => router.push(`/post/${marker.id}`)}
            >
              <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{marker.description}</p>
              
              {/* Preview da imagem */}
              {marker.images && marker.images.length > 0 && (
                <div className="mb-2 relative">
                  <ImageViewer 
                    images={marker.images.map(img => getImageUrl(img))} 
                    initialIndex={0}
                  >
                    <div className="relative cursor-pointer">
                      <Image
                        src={getImageUrl(marker.images[0])}
                        alt={marker.title}
                        width={280}
                        height={160}
                        className="rounded object-cover w-full h-40"
                        unoptimized
                      />
                      {marker.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          +{marker.images.length - 1} foto{marker.images.length > 2 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </ImageViewer>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-gray-100">
                  {marker.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  marker.status === "Resolvido" ? "bg-green-100 text-green-700 font-bold" :
                  marker.status === "Em Revisão" ? "bg-blue-100 text-blue-700 font-bold" :
                  "bg-red-100 text-red-700 font-bold"
                }`}>
                  {marker.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {focusPosition && <Marker position={focusPosition} />}
      <SetViewOnFocus focusPosition={focusPosition} />
      <SetViewOnMarkers markers={markers} />
      <MapLegend categories={categories} />
    </MapContainer>
  );
}