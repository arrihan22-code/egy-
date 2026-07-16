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

const TYPE_ICONS: Record<string, string> = {
  bank: '\u{1F3E6}',
  pharmacy: '\u{1F48A}',
  hospital: '\u{1F3E5}',
  government: '\u{1F3DB}',
  transport: '\u{1F687}',
  emergency: '\u{1F6A8}',
};

const TYPE_COLORS: Record<string, string> = {
  bank: '#2563eb',
  pharmacy: '#16a34a',
  hospital: '#dc2626',
  government: '#9333ea',
  transport: '#ca8a04',
  emergency: '#dc2626',
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
      const color = TYPE_COLORS[marker.type] || '#6b7280';
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${TYPE_ICONS[marker.type] || '?'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const m = L.marker([marker.latitude, marker.longitude], { icon }).addTo(map);
      m.bindTooltip(marker.name, { direction: 'top' });

      if (onMarkerClick) {
        m.on('click', () => onMarkerClick(marker.id, marker.type));
      }
    }

    if (markers.length > 0 && !center) {
      const group = L.featureGroup(markers.map(m => L.marker([m.latitude, m.longitude])));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers, center]);

  return <div ref={mapRef} style={{ width: '100%', height: height || '400px' }} />;
}
