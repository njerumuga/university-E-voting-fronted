import React, { useEffect, useState } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function ResultsPage({ onNavigate }) {
    // Note: Ensure your VotingContext exports a refresh function or candidates update automatically
    const { phase, candidates } = useVoting(); 
    const [groupedResults, setGroupedResults] = useState({});

    useEffect(() => {
        // Group and Sort Logic
        const groups = candidates.reduce((acc, c) => {
            const school = c.school || 'General';
            const pos = c.position || 'General Seat';

            if (!acc[school]) acc[school] = {};
            if (!acc[school][pos]) acc[school][pos] = [];

            acc[school][pos].push(c);
            return acc;
        }, {});

        Object.keys(groups).forEach(school => {
            Object.keys(groups[school]).forEach(pos => {
                groups[school][pos].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
            });
        });

        setGroupedResults(groups);
    }, [candidates]);

    // OPTIONAL: If your context doesn't auto-refresh, you can add a local fetch here
    // useEffect(() => {
    //    const interval = setInterval(() => { /* logic to fetch candidates */ }, 5000);
    //    return () => clearInterval(interval);
    // }, []);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('home')}>← Exit Results</button>
                <h1 style={styles.mainTitle}>
                    {phase === PHASES.CLOSED ? '🏁 Final Certification' : '📊 Live Tally'}
                </h1>
                <div style={styles.statusBadge}>
                    {phase.toUpperCase()}
                </div>
            </div>

            {Object.keys(groupedResults).length > 0 ? (
                Object.entries(groupedResults).map(([school, positions]) => (
                    <div key={school} style={{ marginBottom: '50px' }}>
                        <h2 style={styles.schoolHeader}>📍 {school.toUpperCase()}</h2>

                        {Object.entries(positions).map(([pos, list]) => (
                            <div key={pos} style={{ marginBottom: '30px' }}>
                                <h3 style={styles.posTitle}>{pos}</h3>
                                <div style={styles.grid}>
                                    {list.map((c, index) => (
                                        <div
                                            key={c.id}
                                            className="card"
                                            style={{
                                                ...styles.resultCard,
                                                borderColor: index === 0 && c.voteCount > 0 ? 'var(--green)' : 'var(--border)',
                                                background: index === 0 && c.voteCount > 0 ? 'rgba(0, 255, 136, 0.03)' : 'var(--card)'
                                            }}
                                        >
                                            <div style={styles.leftInfo}>
                                                <div style={styles.rank}>#{index + 1}</div>
                                                <div>
                                                    <div style={styles.name}>
                                                        {c.name}
                                                        {index === 0 && c.voteCount > 0 && <span title="Leading" style={{marginLeft: '10px'}}>👑</span>}
                                                    </div>
                                                    <div className="text-muted" style={{fontSize: '0.8rem'}}>{c.party}</div>
                                                </div>
                                            </div>
                                            <div style={styles.rightStats}>
                                                <div style={{...styles.voteCount, color: index === 0 && c.voteCount > 0 ? 'var(--green)' : 'var(--white)'}}>
                                                    {c.voteCount || 0}
                                                </div>
                                                <div style={styles.voteLabel}>TOTAL VOTES</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p className="text-muted">The ballot boxes are currently empty.</p>
                </div>
            )}

            <div style={{textAlign: 'center', paddingBottom: '60px'}}>
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate('home')}>Return to Portal Home</button>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' },
    mainTitle: { fontFamily: 'var(--font-display)', margin: 0, fontSize: '2rem', letterSpacing: '-0.02em' },
    statusBadge: { padding: '6px 12px', background: 'var(--accent)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--navy)' },
    schoolHeader: { borderLeft: '4px solid var(--accent)', paddingLeft: '15px', color: 'var(--accent)', marginBottom: '25px', fontSize: '1.2rem' },
    posTitle: { fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '15px' },
    grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    resultCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 25px', borderWidth: '1px' },
    leftInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
    rank: { fontSize: '1.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', width: '30px' },
    name: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)' },
    rightStats: { textAlign: 'right' },
    voteCount: { fontSize: '1.4rem', fontWeight: 800 },
    voteLabel: { fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.05em' }
};