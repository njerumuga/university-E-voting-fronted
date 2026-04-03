import React, { useState } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function VoterLoginPage({ onNavigate }) {
    const { loginVoter, phase } = useVoting();
    const [form, setForm] = useState({ admissionNumber: '', password: '' }); // CHANGED: fullName to password
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.admissionNumber || !form.password) {
            setError('Please enter both your admission number and password.');
            return;
        }

        setLoading(true);
        // Using the updated context method that sends admissionNumber and password
        const result = await loginVoter(form.admissionNumber, form.password);
        setLoading(false);

        if (!result.success) {
            setError(result.message);
        } else {
            onNavigate('vote'); // Navigate to ballot selection
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginBottom: 20, alignSelf: 'flex-start' }}
                    onClick={() => onNavigate('home')}
                >
                    ← Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗳️</div>
                    <h1 style={styles.heading}>Student Login</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Provide your credentials to access the ballot.
                    </p>
                </div>

                {/* Phase Status Banner */}
                {phase === PHASES.VOTING ? (
                    <div className="badge badge-green" style={{ marginBottom: 20, textAlign: 'center', display: 'block', padding: '10px' }}>
                        🚀 Voting is currently LIVE!
                    </div>
                ) : (
                    <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                        {phase === PHASES.REGISTRATION
                            ? '⏳ Voting has not started yet. Please wait for the admin to open the polls.'
                            : '🏁 The election has ended.'}
                    </div>
                )}

                {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admission Number</label>
                        <input
                            className="form-input"
                            name="admissionNumber"
                            placeholder="e.g. CT203/119095"
                            value={form.admissionNumber}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            name="password"
                            type="password"
                            placeholder="Enter your registration password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        style={{ marginTop: 12 }}
                        disabled={phase !== PHASES.VOTING || loading}
                    >
                        {loading ? 'Authenticating...' : 'Access Ballot →'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--navy)'
    },
    box: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '36px',
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column'
    },
    heading: {
        fontFamily: 'var(--font-display)',
        fontSize: '1.8rem',
        fontWeight: 700,
        marginBottom: 8
    }
};