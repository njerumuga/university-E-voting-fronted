import React, { useState, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';

export default function VotingPage({ onNavigate }) {
    const { candidates, castVote, user, fetchMyCandidates } = useVoting();
    const [selections, setSelections] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('voter_token');
        if (token) {
            fetchMyCandidates(token);
        }
    }, [fetchMyCandidates]);

    const filteredCandidates = candidates.filter(c => {
        const candidateSchool = c.school ? c.school.trim().toLowerCase() : 'universal';
        const voterSchool = user?.school ? user.school.trim().toLowerCase() : '';
        return candidateSchool === voterSchool || candidateSchool === 'universal' || candidateSchool === 'general';
    });

    const groupedCandidates = filteredCandidates.reduce((groups, candidate) => {
        const posKey = (candidate.position || 'General').trim().toUpperCase();
        if (!groups[posKey]) groups[posKey] = [];
        groups[posKey].push(candidate);
        return groups;
    }, {});

    const handleSelect = (positionName, id) => {
        const seatKey = positionName.trim().toUpperCase();
        setSelections(prev => ({ ...prev, [seatKey]: id }));
    };

    // --- UPDATED HANDLE CONFIRM ---
    const handleConfirm = async () => {
        const positionsAvailable = Object.keys(groupedCandidates);

        if (positionsAvailable.length === 0) {
            return alert("No candidates available for your faculty at this time.");
        }

        if (Object.keys(selections).length < positionsAvailable.length) {
            return alert("Please select a candidate for every category before submitting.");
        }

        setLoading(true);

        try {
            const votePromises = Object.values(selections).map(id =>
                castVote({ candidateId: id })
            );

            const results = await Promise.all(votePromises);
            
            // Check context .success key
            const allSuccessful = results.every(res => res && res.success);

            if (allSuccessful) {
                alert("Success! Your ballot has been securely recorded.");
                onNavigate('results');
            } else {
                const failedRes = results.find(res => !res.success);
                alert(failedRes?.message || "Voting failed. You may have already cast your ballot.");
            }
        } catch (err) {
            alert("Connection error: Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    if (!user && !localStorage.getItem('voter_token')) {
        return (
            <div style={styles.layout}>
                <div className="glass-card" style={{margin: 'auto', textAlign: 'center', padding: '50px'}}>
                    <h2 style={{color: 'white'}}>Session Expired</h2>
                    <p style={{color: 'white', opacity: 0.7}}>Please log in to access the voting booth.</p>
                    <button className="btn btn-primary" onClick={() => onNavigate('login')} style={{marginTop: 20}}>Return to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.layout}>
            <aside style={styles.sidebar}>
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Election Core</h2>
                </div>
                <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <p style={styles.metaLabel}>VOTER PROFILE</p>
                    <p style={styles.profileName}>{user?.name || 'Loading...'}</p>
                    <hr style={styles.divider} />
                    <p style={styles.metaLabel}>ASSIGNED FACULTY</p>
                    <p style={styles.facultyName}>{user?.school || 'Not Assigned'}</p>
                </div>
                <button className="btn btn-secondary btn-full" onClick={() => onNavigate('home')}>🚫 Cancel & Exit</button>
                <div style={styles.footerNote}>🔒 Encrypted Session Active</div>
            </aside>

            <main style={styles.mainContent}>
                <div style={{ maxWidth: '750px', margin: '0 auto' }} className="fade-up">
                    <h1 style={styles.mainTitle}>Official Ballot</h1>
                    <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '40px', color: 'white' }}>
                        Choose your representatives carefully. This action cannot be undone.
                    </p>

                    {Object.keys(groupedCandidates).length > 0 ? (
                        Object.entries(groupedCandidates).map(([positionLabel, list]) => {
                            const seatKey = positionLabel.trim().toUpperCase();
                            return (
                                <div key={seatKey} style={{ marginBottom: '45px' }}>
                                    <h3 style={styles.positionHeader}>{seatKey}</h3>
                                    <div style={styles.grid}>
                                        {list.map(c => {
                                            const isSelected = selections[seatKey] === c.id;
                                            return (
                                                <div
                                                    key={c.id}
                                                    className="glass-card"
                                                    style={{
                                                        ...styles.ballotCard,
                                                        border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                                        background: isSelected ? 'rgba(255, 204, 0, 0.12)' : 'var(--glass-card)',
                                                        transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                                                    }}
                                                    onClick={() => handleSelect(positionLabel, c.id)}
                                                >
                                                    <div style={{
                                                        ...styles.radio,
                                                        background: isSelected ? 'var(--accent-gold)' : 'transparent',
                                                        boxShadow: isSelected ? '0 0 15px var(--accent-gold)' : 'none',
                                                        borderColor: isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'
                                                    }} />
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={styles.candidateName}>{c.name}</h4>
                                                        <p style={styles.partyText}>{c.party} | {c.school}</p>
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
                            <p style={{ color: 'var(--accent-gold)' }}>No candidates found for <strong>{user?.school}</strong> yet.</p>
                            <button className="btn btn-sm btn-secondary" onClick={() => fetchMyCandidates(localStorage.getItem('voter_token'))} style={{marginTop: 15}}>🔄 Refresh List</button>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={styles.submitBtn}
                        disabled={loading || Object.keys(groupedCandidates).length === 0}
                        onClick={handleConfirm}
                    >
                        {loading ? '🔐 SECURING VOTE...' : 'SUBMIT FINAL BALLOT'}
                    </button>
                </div>
            </main>
        </div>
    );
}

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: 'var(--primary-green)' },
    sidebar: { width: '320px', padding: '40px 25px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, height: '100vh' },
    mainContent: { flex: 1, padding: '60px 50px', overflowY: 'auto' },
    mainTitle: { textAlign: 'center', fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px', color: 'white' },
    metaLabel: { margin: 0, fontSize: '0.65rem', opacity: 0.6, letterSpacing: '1px', fontWeight: 800, color: 'white' },
    profileName: { fontWeight: '700', fontSize: '1rem', margin: '4px 0 0 0', color: 'white' },
    facultyName: { color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.95rem', margin: '4px 0 0 0' },
    divider: { margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' },
    footerNote: { marginTop: 'auto', textAlign: 'center', opacity: 0.4, fontSize: '0.7rem', color: 'white' },
    positionHeader: { fontSize: '0.85rem', letterSpacing: '3px', color: 'var(--accent-gold)', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', fontWeight: 800 },
    grid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    ballotCard: { display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)', padding: '25px', borderRadius: '20px' },
    candidateName: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'white' },
    partyText: { margin: 0, opacity: 0.6, fontSize: '0.85rem', color: 'white' },
    radio: { width: '26px', height: '26px', borderRadius: '50%', border: '2px solid', transition: '0.3s ease' },
    submitBtn: { width: '100%', padding: '26px', fontSize: '1.2rem', marginTop: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }
};