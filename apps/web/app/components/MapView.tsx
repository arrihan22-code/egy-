'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (id: string, type: string) => void;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  bank: '#0A66C2',
  pharmacy: '#10B981',
  hospital: '#EF4444',
  government: '#8B5CF6',
  transport: '#F59E0B',
  emergency: '#DC2626',
};

export default function MapView({ markers, center, zoom, height, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const map = L.map(mapRef.current, {
      center: center ? [center.lat, center.lng] : [26.8206, 30.8025],
      zoom: zoom || 6,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    for (const marker of markers) {
      const color = TYPE_COLORS[marker.type] || '#6B7280';
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background: ${color};
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 2px solid white;
          transition: transform 0.15s;
        ">${'\u{1F3E6}'}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const m = L.marker([marker.latitude, marker.longitude], { icon }).addTo(map);

      const tooltipContent = `<div style="font-weight:600;font-size:13px;padding:2px 0">${marker.name}</div>`;
      m.bindTooltip(tooltipContent, { direction: 'top', offset: L.point(0, -8) });

      if (onMarkerClick) {
        m.on('click', () => onMarkerClick(marker.id, marker.type));
      }
    }

    if (markers.length > 0 && !center) {
      try {
        const group = L.featureGroup(markers.map(m => L.marker([m.latitude, m.longitude])));
        map.fitBounds(group.getBounds().pad(0.1));
      } catch {}
    }
  }, [markers, center]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: height || '400px', borderRadius: 'inherit' }}
    />
  );
}
