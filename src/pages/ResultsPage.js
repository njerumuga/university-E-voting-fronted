import React, { useEffect } from 'react';
import { useVoting } from '../context/VotingContext';

export default function ResultsPage({ onNavigate }) {
    const { candidates = [], fetchCandidates } = useVoting();

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    // Grouping logic: ensures candidates show up even if votes are 0
    const groupedResults = (candidates || []).reduce((acc, curr) => {
        const pos = curr.position || 'General Positions';
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(curr);
        return acc;
    }, {});

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('home')}>← EXIT</button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '20px' }}>🏁 Final Results</h1>
                <p style={{ opacity: 0.6 }}>Official Live Election Standing</p>
            </div>

            <div style={styles.resultsGrid}>
                {Object.keys(groupedResults).length > 0 ? (
                    Object.entries(groupedResults).map(([position, list]) => {
                        const totalVotes = list.reduce((sum, c) => sum + (c.voteCount || c.vote_count || 0), 0);
                        
                        const sortedList = [...list].sort((a, b) => 
                            (b.voteCount || b.vote_count || 0) - (a.voteCount || a.vote_count || 0)
                        );

                        return (
                            <div key={position} className="glass-card" style={styles.categoryCard}>
                                <h3 style={styles.posTitle}>{position.toUpperCase()}</h3>
                                <small style={{opacity: 0.5}}>{totalVotes} Total Votes Cast</small>
                                
                                <div style={{ marginTop: '20px' }}>
                                    {sortedList.map((cand, index) => {
                                        const votes = cand.voteCount || cand.vote_count || 0;
                                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                        
                                        return (
                                            <div key={cand.id} style={{ marginBottom: '20px' }}>
                                                <div style={styles.labelRow}>
                                                    <span>
                                                        {index === 0 && votes > 0 ? '👑 ' : ''}
                                                        {cand.name}
                                                    </span>
                                                    <strong>{votes} votes ({percentage}%)</strong>
                                                </div>
                                                <div style={styles.barBg}>
                                                    <div style={{ 
                                                        ...styles.barFill, 
                                                        width: `${percentage}%`,
                                                        background: index === 0 && votes > 0 ? '#ffcc00' : '#00ff88' 
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <p>⌛ Waiting for live election data...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', padding: '60px 20px', background: 'var(--primary-green)', color: 'white' },
    header: { textAlign: 'center', marginBottom: '50px' },
    resultsGrid: { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' },
    categoryCard: { padding: '30px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
    posTitle: { color: 'var(--accent-gold)', letterSpacing: '2px', margin: 0, fontSize: '1.1rem', fontWeight: '800' },
    labelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' },
    barBg: { background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: '5px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }
};