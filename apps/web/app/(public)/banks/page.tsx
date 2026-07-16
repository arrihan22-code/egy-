export default async function BanksPage() {
  let banks: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/banks`, { cache: 'no-store' });
    const json = await res.json();
    banks = json.data || [];
  } catch {
    banks = [];
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Banks & ATMs</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Find banks, branches, and ATMs across Egypt</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input placeholder="Search banks..." style={{ flex: 1 }} />
        <select><option>All Governorates</option></select>
        <button>Search</button>
      </div>

      {banks.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Loading banks...</p>
      ) : (
        <div className="grid">
          {banks.map((bank: any) => (
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
    </div>
  );
}
