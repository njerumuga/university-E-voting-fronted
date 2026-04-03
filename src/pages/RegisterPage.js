import React, { useState } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function RegisterPage({ onNavigate }) {
    const { registerVoter, phase } = useVoting();
    const [form, setForm] = useState({
        fullName: '',
        admissionNumber: '',
        email: '',
        school: '',
        course: '',
        year: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Style helper for dropdown fix
    const selectStyle = {
        backgroundColor: '#1f2937', // Forced dark background
        color: 'white',
        border: '1px solid var(--border)',
    };

    if (phase !== PHASES.REGISTRATION) {
        return (
            <div style={styles.container}>
                <div className="card" style={styles.box}>
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔒</div>
                        <h2 style={styles.heading}>Registration is Closed</h2>
                        <p className="text-muted">The registration portal for the 2026 elections is currently offline.</p>
                        <button className="btn btn-secondary" style={{marginTop: 20}} onClick={() => onNavigate('home')}>Return to Portal</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await registerVoter(form);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("University Server is unreachable. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div className="card" style={styles.box}>
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛡️</div>
                        <h2 style={{ ...styles.heading, color: 'var(--accent)' }}>Voter Account Created</h2>
                        <p className="text-muted">Welcome to the electorate, <strong>{form.fullName}</strong></p>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 15 }}>
                            You are registered under the <strong>{form.school}</strong>.
                            Please log in during the voting phase to cast your ballot.
                        </p>
                        <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                            <button className="btn btn-secondary btn-full" onClick={() => onNavigate('home')}>Back to Home</button>
                            <button className="btn btn-primary btn-full" onClick={() => onNavigate('login')}>Proceed to Login</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.box} className="fade-up">
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 25 }} onClick={() => onNavigate('home')}>← Portal Home</button>
                <h1 style={styles.heading}>Student Registration</h1>
                <p style={{textAlign: 'center', color: 'var(--muted)', marginBottom: 30, fontSize: '0.9rem'}}>Enter your official university credentials below.</p>

                {error && <div className="alert alert-error" style={{ marginBottom: 25 }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Legal Name</label>
                        <input className="form-input" name="fullName" value={form.fullName} onChange={handleChange} required />
                    </div>

                    <div style={styles.grid2}>
                        <div className="form-group">
                            <label className="form-label">Admission Number</label>
                            <input className="form-input" name="admissionNumber" placeholder="CT201/..." value={form.admissionNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Select School</label>
                            <select
                                className="form-input"
                                style={selectStyle}
                                name="school"
                                value={form.school}
                                onChange={handleChange}
                                required
                            >
                                <option value="" style={{background: '#1f2937'}}>Select Faculty</option>
                                <option value="Computing" style={{background: '#1f2937'}}>School of Computing</option>
                                <option value="Business" style={{background: '#1f2937'}}>School of Business</option>
                                <option value="Engineering" style={{background: '#1f2937'}}>School of Engineering</option>
                                <option value="Nursing" style={{background: '#1f2937'}}>School of Nursing</option>
                                <option value="Arts" style={{background: '#1f2937'}}>School of Arts & Social Sciences</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Official Email Address</label>
                        <input className="form-input" name="email" type="email" placeholder="student@university.ac.ke" value={form.email} onChange={handleChange} required />
                    </div>

                    <div style={styles.grid2}>
                        <div className="form-group">
                            <label className="form-label">Course Name</label>
                            <input className="form-input" name="course" placeholder="e.g. Bsc. IT" value={form.course} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year of Study</label>
                            <select
                                className="form-input"
                                style={selectStyle}
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                required
                            >
                                <option value="" style={{background: '#1f2937'}}>Year</option>
                                <option value="1" style={{background: '#1f2937'}}>1st Year</option>
                                <option value="2" style={{background: '#1f2937'}}>2nd Year</option>
                                <option value="3" style={{background: '#1f2937'}}>3rd Year</option>
                                <option value="4" style={{background: '#1f2937'}}>4th Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Security Password</label>
                        <input className="form-input" name="password" type="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 15 }}>
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', background: 'var(--navy)' },
    box: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
    heading: { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--white)', marginBottom: 8, textAlign: 'center' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
};