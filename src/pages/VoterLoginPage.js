import React, { useState } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function VoterLoginPage({ onNavigate }) {
    const { loginVoter, phase } = useVoting();
    const [form, setForm] = useState({ admissionNumber: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.admissionNumber || !form.password) {
            setError('Please enter both credentials.');
            return;
        }
        setLoading(true);
        const result = await loginVoter(form.admissionNumber, form.password);
        setLoading(false);

        if (!result.success) setError(result.message);
        else onNavigate('vote');
    };

    return (
        <div style={styles.container}>
            <div className="glass-card fade-up" style={styles.box}>
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate('home')}>← Back</button>
                
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 10 }}>🔑</div>
                    <h1 style={styles.heading}>Student Login</h1>
                    <p style={{ opacity: 0.7 }}>Secure Infrastructure Access</p>
                </div>

                {phase !== PHASES.VOTING && (
                    <div style={styles.phaseAlert}>
                        {phase === PHASES.REGISTRATION ? '⏳ Voting hasn\'t started yet.' : '🏁 Election is closed.'}
                    </div>
                )}

                {error && <div className="alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admission Number</label>
                        <input className="form-input" name="admissionNumber" placeholder="CT203/..." value={form.admissionNumber} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Booth Password</label>
                        <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || phase !== PHASES.VOTING}>
                        {loading ? 'Authenticating...' : 'Enter Voting Booth'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    box: { width: '100%', maxWidth: '460px', padding: '40px' },
    heading: { fontSize: '2rem', fontWeight: 800 },
    phaseAlert: { background: 'rgba(255,204,0,0.1)', padding: '15px', borderRadius: '12px', color: 'var(--accent-gold)', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }
};