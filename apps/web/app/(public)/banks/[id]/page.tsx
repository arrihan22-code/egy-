interface Props {
  params: { id: string };
}

export default async function BankDetailPage({ params }: Props) {
  let bank: any = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/banks/${params.id}`, { cache: 'no-store' });
    const json = await res.json();
    bank = json.data || null;
  } catch {
    bank = null;
  }

  if (!bank) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Bank not found</p>;
  }

  return (
    <div>
      <a href="/banks" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to Banks</a>

      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{bank.nameAr}</h1>
        {bank.nameEn && <p style={{ color: '#6b7280' }}>{bank.nameEn}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        {bank.phone && (
          <div className="card">
            <strong>Phone</strong>
            <p>{bank.phone}</p>
          </div>
        )}
        {bank.website && (
          <div className="card">
            <strong>Website</strong>
            <p><a href={bank.website} target="_blank">{bank.website}</a></p>
          </div>
        )}
      </div>

      {bank.branches && bank.branches.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Branches ({bank.branches.length})</h2>
          <div className="grid">
            {bank.branches.map((branch: any) => (
              <div key={branch.id} className="card">
                <h3>{branch.nameAr}</h3>
                {branch.street && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{branch.street}</p>}
                {branch.phone && <p style={{ fontSize: '0.875rem' }}>📞 {branch.phone}</p>}
                {branch.hasAtm && <span style={{ background: '#dbeafe', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>ATM</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
