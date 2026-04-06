import React, { useState, useEffect } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function LandingPage({ onNavigate }) {
    const { phase } = useVoting();
    const [showAdminAccess, setShowAdminAccess] = useState(false);

    // --- SECRET ADMIN TRIGGER ---
    // Press Shift + A to reveal the dashboard button at the bottom
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey && e.key === 'A') {
                setShowAdminAccess(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={styles.container}>
            {/* Background decoration - EXACTLY AS ORIGINAL */}
            <div style={styles.bgGlow} />
            <div style={styles.bgGrid} />

            <div style={styles.hero}>
                <div className="fade-up" style={styles.pill}>
                    <span style={styles.pillDot} /> University Student E-Voting System 2026
                </div>

                <h1 className="fade-up-1" style={styles.title}>
                    Empowering Every<br />
                    <span style={styles.titleAccent}>Student Voice.</span>
                </h1>

                <p className="fade-up-2" style={styles.subtitle}>
                    The official secure voting platform for all University Schools.
                    Select your faculty, cast your ballot, and lead the change for your department.
                </p>

                <div className="fade-up-3" style={styles.actions}>
                    {phase === PHASES.REGISTRATION && (
                        <>
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('register')}>
                                Register to Vote
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('login')}>
                                Student Login
                            </button>
                        </>
                    )}
                    {phase === PHASES.VOTING && (
                        <>
                            <button className="btn btn-success btn-lg" onClick={() => onNavigate('login')}>
                                🗳️ Enter Voting Booth
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('results')}>
                                Live Standings
                            </button>
                        </>
                    )}
                    {phase === PHASES.CLOSED && (
                        <>
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('results')}>
                                📊 View Final Tallies
                            </button>
                        </>
                    )}
                </div>

                {/* Phase status */}
                <div className="fade-up-3" style={{ marginTop: 32 }}>
                    {phase === PHASES.REGISTRATION && (
                        <span className="badge badge-yellow">📋 Registration Phase Active</span>
                    )}
                    {phase === PHASES.VOTING && (
                        <span className="badge badge-green">🟢 Election Live: Cast Your Ballot</span>
                    )}
                    {phase === PHASES.CLOSED && (
                        <span className="badge badge-blue">🏁 2026 General Election Closed</span>
                    )}
                </div>
            </div>

            {/* Feature cards - EXACTLY AS ORIGINAL */}
            <div style={styles.features}>
                {[
                    { icon: '🏛️', title: 'Faculty Specific', desc: 'Ballots are automatically filtered by your specific University School or Faculty.' },
                    { icon: '🔐', title: 'Tamper Proof', desc: 'Advanced JWT encryption ensures one student, one vote. No duplicates allowed.' },
                    { icon: '📱', title: 'Mobile First', desc: 'Vote from your lecture hall, hostel, or anywhere on campus via any device.' },
                    { icon: '📊', title: 'Instant Auditing', desc: 'Real-time transparency for candidates and university administrators.' },
                ].map((f, i) => (
                    <div key={i} className="card" style={styles.featureCard}>
                        <div style={styles.featureIcon}>{f.icon}</div>
                        <h3 style={styles.featureTitle}>{f.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* HIDDEN ADMIN LINK - Only shows on Shift + A */}
            {showAdminAccess && (
                <div style={styles.adminLink}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('admin')}
                        style={{ opacity: 0.8, fontSize: '0.75rem' }}
                    >
                        🛡️ COMMISSIONER DASHBOARD
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--primary-green)' // Updated to your green theme
    },
    bgGlow: {
        position: 'fixed',
        top: '-200px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255,204,0,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
    },
    bgGrid: {
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        zIndex: 0,
    },
    hero: {
        textAlign: 'center',
        maxWidth: '700px',
        position: 'relative',
        zIndex: 1,
        paddingTop: '20px',
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,204,0,0.1)',
        border: '1px solid rgba(255,204,0,0.2)',
        borderRadius: 30,
        padding: '8px 20px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--accent-gold)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 32,
    },
    pillDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--accent-gold)',
        display: 'inline-block',
    },
    title: {
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
        fontWeight: 900,
        lineHeight: 1.05,
        marginBottom: 24,
        color: 'white',
        letterSpacing: '-0.02em'
    },
    titleAccent: {
        color: 'var(--accent-gold)',
        display: 'block',
    },
    subtitle: {
        fontSize: '1.15rem',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 1.6,
        marginBottom: 48,
        maxWidth: '580px',
        marginInline: 'auto'
    },
    actions: {
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        maxWidth: '1000px',
        width: '100%',
        marginTop: 100,
        position: 'relative',
        zIndex: 1,
    },
    featureCard: {
        textAlign: 'center',
        padding: '35px 25px',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px'
    },
    featureIcon: {
        fontSize: '2.5rem',
        marginBottom: 16,
    },
    featureTitle: {
        fontFamily: 'var(--font-display)',
        fontSize: '1.1rem',
        marginBottom: 10,
        color: 'white',
        fontWeight: 700
    },
    adminLink: {
        marginTop: 60,
        position: 'relative',
        zIndex: 1,
    },
};