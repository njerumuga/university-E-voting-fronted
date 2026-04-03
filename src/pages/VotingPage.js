import React, { useState, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';

export default function VotingPage({ onNavigate }) {
    const { candidates, castVote, currentVoter } = useVoting();
    // We now track multiple selections: one per position
    const [selections, setSelections] = useState({});
    const [loading, setLoading] = useState(false);

    // Group candidates by position (School Rep, Mens Rep, Womens Rep)
    const groupedCandidates = candidates.reduce((groups, candidate) => {
        const pos = candidate.position || 'General';
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(candidate);
        return groups;
    }, {});

    const handleSelect = (position, id) => {
        setSelections(prev => ({
            ...prev,
            [position]: id
        }));
    };

    const handleConfirm = async () => {
        const positionsAvailable = Object.keys(groupedCandidates);

        if (positionsAvailable.length === 0) {
            return alert("No candidates available to vote for.");
        }

        if (Object.keys(selections).length < positionsAvailable.length) {
            return alert("Please select a candidate for every position before submitting your ballot.");
        }

        setLoading(true);

        try {
            // We loop through each selected candidate ID to cast the votes
            // This ensures all selections (Rep, Men's, Women's) are counted
            const votePromises = Object.values(selections).map(id =>
                castVote({ candidateId: id })
            );

            const results = await Promise.all(votePromises);
            const allSuccessful = results.every(res => res.success);

            if (allSuccessful) {
                alert("Success! All your selections have been securely counted.");
                onNavigate('results');
            } else {
                // If one fails (usually because of 'hasVoted' check), show error
                const errorMsg = results.find(r => !r.success)?.message;
                alert(errorMsg || "Voting failed. You may have already cast your ballot.");
            }
        } catch (err) {
            alert("Connection error: Could not reach the university server.");
        } finally {
            setLoading(false);
        }
    };

    // If session is lost, show login redirect
    if (!currentVoter) {
        return (
            <div style={styles.container}>
                <div className="card" style={{textAlign: 'center', padding: '40px'}}>
                    <div style={{fontSize: '3rem', marginBottom: '20px'}}>🔑</div>
                    <h2 style={{color: 'white'}}>Session Expired</h2>
                    <p className="text-muted">Please log in again to access your official ballot.</p>
                    <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => onNavigate('login')}>Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header Area */}
            <div className="fade-up" style={styles.header}>
                <button className="btn btn-secondary btn-sm" style={{marginBottom: '20px'}} onClick={() => onNavigate('home')}>
                    ← Exit Ballot
                </button>
                <h1 style={styles.title}>University Ballot</h1>
                <div style={styles.voterInfo}>
                    <p style={{margin: 0}}>Faculty: <strong style={{color: 'var(--accent)'}}>{currentVoter.school || 'Not Assigned'}</strong></p>
                    <p style={{margin: 0}}>Student: <strong>{currentVoter.name}</strong></p>
                </div>
            </div>

            {/* Voting Sections */}
            {Object.keys(groupedCandidates).length > 0 ? (
                Object.entries(groupedCandidates).map(([position, list]) => (
                    <div key={position} style={{ marginBottom: '40px' }} className="fade-up">
                        <h2 style={styles.positionHeader}>{position.toUpperCase()}</h2>
                        <div style={styles.grid}>
                            {list.map(c => (
                                <div
                                    key={c.id}
                                    className="card"
                                    style={{
                                        ...styles.ballotCard,
                                        borderColor: selections[position] === c.id ? 'var(--accent)' : 'var(--border)',
                                        background: selections[position] === c.id ? 'rgba(240,165,0,0.05)' : 'rgba(255,255,255,0.02)'
                                    }}
                                    onClick={() => handleSelect(position, c.id)}
                                >
                                    <div style={{
                                        ...styles.radio,
                                        background: selections[position] === c.id ? 'var(--accent)' : 'transparent',
                                        boxShadow: selections[position] === c.id ? '0 0 10px var(--accent)' : 'none'
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{c.name}</h3>
                                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{c.party}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px', borderStyle: 'dashed' }}>
                    <p style={{color: 'var(--accent)'}}>No candidates found for the <strong>{currentVoter.school}</strong> yet.</p>
                    <small className="text-muted">Admins are currently finalizing the ballot for your faculty.</small>
                </div>
            )}

            {/* Submit Button */}
            <button
                className="btn btn-primary btn-full btn-lg"
                style={{
                    marginTop: '20px',
                    position: 'sticky',
                    bottom: '20px',
                    boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
                }}
                disabled={loading || Object.keys(groupedCandidates).length === 0}
                onClick={handleConfirm}
            >
                {loading ? '🔒 Encrypting & Submitting...' : 'Confirm & Submit Final Selections'}
            </button>
        </div>
    );
}

const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '60px 20px', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px', color: 'white' },
    voterInfo: { background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' },
    positionHeader: {
        fontSize: '0.85rem',
        letterSpacing: '0.2em',
        color: 'var(--accent)',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '10px',
        marginBottom: '20px',
        fontWeight: 800
    },
    grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    ballotCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        borderWidth: '2px',
        padding: '20px'
    },
    radio: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '2px solid var(--accent)',
        transition: 'all 0.2s ease'
    }
};