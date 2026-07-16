'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false });

interface Bank {
  id: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  website?: string;
  branches?: { id: string; nameAr: string; latitude: number; longitude: number }[];
}

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/banks`, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setBanks(j.data || []))
      .catch(() => {});
  }, []);

  const markers = banks.flatMap(b =>
    (b.branches || []).map(br => ({
      id: br.id,
      name: `${b.nameAr} - ${br.nameAr}`,
      type: 'bank' as const,
      latitude: Number(br.latitude),
      longitude: Number(br.longitude),
    }))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Banks & ATMs</h1>
          <p style={{ color: '#6b7280' }}>Find banks, branches, and ATMs across Egypt</p>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          style={{
            padding: '0.5rem 1rem',
            background: showMap ? '#6b7280' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          {showMap ? 'Show List' : 'Show Map'}
        </button>
      </div>

      {showMap ? (
        <MapView markers={markers} height="600px" />
      ) : (
        <>
          {banks.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Loading banks...</p>
          ) : (
            <div className="grid">
              {banks.map(bank => (
                <a key={bank.id} href={`/banks/${bank.id}`} className="card" style={{ display: 'block' }}>
                  <h3>{bank.nameAr}</h3>
                  {bank.nameEn && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{bank.nameEn}</p>}
                  {bank.phone && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>📞 {bank.phone}</p>}
                  {bank.branches && <p style={{ fontSize: '0.875rem', color: '#2563eb', marginTop: '0.5rem' }}>
                    {bank.branches.length} branches
                  </p>}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
