'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MAPS_API = process.env.NEXT_PUBLIC_MAPS_API || 'http://localhost:3070/api/v1/maps';

const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };

export default function MapsAdminPage() {
  const [testLat, setTestLat] = useState('30.0444');
  const [testLng, setTestLng] = useState('31.2357');
  const [radius, setRadius] = useState('5');
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [reverseGeo, setReverseGeo] = useState<any>(null);
  const [distance, setDistance] = useState<any>(null);

  const handleNearby = async () => {
    const res = await fetch(`${MAPS_API}/nearby?lat=${testLat}&lng=${testLng}&radius=${radius}`);
    const json = await res.json();
    setNearbyResults(json.data || []);
  };

  const handleReverseGeo = async () => {
    const res = await fetch(`${MAPS_API}/reverse-geocode?lat=${testLat}&lng=${testLng}`);
    const json = await res.json();
    setReverseGeo(json.data);
  };

  const handleDistance = async () => {
    const res = await fetch(`${MAPS_API}/distance?lat1=${testLat}&lng1=${testLng}&lat2=31.2001&lng2=29.9187`);
    const json = await res.json();
    setDistance(json.data);
  };

  return (
    <div>
      <h1>Maps Administration</h1>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <h2>Test Geocoding</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>Latitude</label>
            <input value={testLat} onChange={e => setTestLat(e.target.value)} style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>Longitude</label>
            <input value={testLng} onChange={e => setTestLng(e.target.value)} style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>Radius (km)</label>
            <input value={radius} onChange={e => setRadius(e.target.value)} style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleNearby} style={{ padding: '0.375rem 0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
            Find Nearby
          </button>
          <button onClick={handleReverseGeo} style={{ padding: '0.375rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
            Reverse Geocode
          </button>
          <button onClick={handleDistance} style={{ padding: '0.375rem 0.75rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
            Distance to Alexandria
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {reverseGeo && (
          <div className="card" style={{ padding: '1rem' }}>
            <h3>Reverse Geocode Result</h3>
            <p><strong>Governorate:</strong> {reverseGeo.governorate?.nameAr || 'Unknown'}</p>
            <p><strong>City:</strong> {reverseGeo.city?.nameAr || 'Unknown'}</p>
          </div>
        )}

        {distance && (
          <div className="card" style={{ padding: '1rem' }}>
            <h3>Distance</h3>
            <p><strong>Distance:</strong> {distance.distanceKm} km</p>
            <p><strong>Bearing:</strong> {distance.bearing} degrees</p>
            <p><strong>Est. Travel:</strong> {Math.round(distance.distanceKm / 40 * 60)} min by car</p>
          </div>
        )}
      </div>

      {nearbyResults.length > 0 && (
        <div>
          <h2>Nearby Results ({nearbyResults.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Distance</th>
                <th style={thStyle}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {nearbyResults.map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{r.nameAr}</td>
                  <td style={tdStyle}>{r.type}</td>
                  <td style={tdStyle}>{Math.round(r.distanceKm * 100) / 100} km</td>
                  <td style={tdStyle}>{r.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
