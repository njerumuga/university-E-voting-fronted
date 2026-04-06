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

    if (phase !== PHASES.REGISTRATION) {
        return (
            <div style={styles.container}>
                <div className="glass-card" style={styles.box}>
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔒</div>
                        <h2 style={styles.heading}>Registration is Closed</h2>
                        <p style={{ opacity: 0.7 }}>The registration portal is currently offline.</p>
                        <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => onNavigate('home')}>Return Home</button>
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
            if (result.success) setSuccess(true);
            else setError(result.message || "Registration failed. Check your details.");
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div className="glass-card fade-up" style={styles.box}>
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛡️</div>
                        <h2 style={{ ...styles.heading, color: 'var(--accent-gold)' }}>Voter Account Created</h2>
                        <p>Welcome, <strong>{form.fullName}</strong>. Your registration is complete.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button className="btn btn-secondary btn-full" onClick={() => onNavigate('home')}>Back</button>
                            <button className="btn btn-primary btn-full" onClick={() => onNavigate('login')}>Login now</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div className="glass-card fade-up" style={styles.box}>
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate('home')}>← BACK</button>
                <h1 style={styles.heading}>Student Registration</h1>
                
                {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

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
                            <label className="form-label">Faculty</label>
                            {/* UPDATED: Changed from select to input */}
                            <input 
                                className="form-input" 
                                name="school" 
                                placeholder="e.g. Computing" 
                                value={form.school} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">University Email</label>
                        <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>

                    <div style={styles.grid2}>
                        <div className="form-group">
                            <label className="form-label">Course Name</label>
                            <input className="form-input" name="course" placeholder="e.g. Bsc IT" value={form.course} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year of Study</label>
                            {/* UPDATED: Changed from select to input and ensured white text */}
                            <input 
                                className="form-input" 
                                name="year" 
                                placeholder="e.g. 3" 
                                value={form.year} 
                                onChange={handleChange} 
                                required 
                                style={styles.textInput}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Create Security Password</label>
                        <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 10 }}>
                        {loading ? 'Creating Account...' : 'COMPLETE REGISTRATION'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    box: { width: '100%', maxWidth: '580px', padding: '40px' },
    heading: { fontSize: '2rem', fontWeight: 800, marginBottom: 15, textAlign: 'center', color: 'white' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    textInput: { color: 'white' } // Ensures text typed in the year field is white
};