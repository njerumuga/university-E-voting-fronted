import React, { useState, useEffect } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function AdminPage({ onNavigate }) {
    const { adminLoggedIn, adminLogin, adminLogout, phase, setElectionPhase } = useVoting();
    const [voters, setVoters] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newCandidate, setNewCandidate] = useState({ name: '', party: '', school: '', position: '' });
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // --- DYNAMIC API URL CONFIGURATION ---
    const BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/api' 
        : 'https://university-e-voting-backend.onrender.com/api';

    useEffect(() => {
        if (adminLoggedIn) fetchAdminData();
    }, [adminLoggedIn]);

    const fetchAdminData = async () => {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const [vRes, cRes] = await Promise.all([
                fetch(`${BASE_URL}/admin/voters`, { headers }),
                fetch(`${BASE_URL}/admin/results`, { headers })
            ]);
            if (vRes.ok) setVoters(await vRes.json());
            if (cRes.ok) setCandidates(await cRes.json());
        } catch (err) { 
            console.error("Admin API Error: Server might be waking up...", err); 
        }
        setLoading(false);
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${BASE_URL}/admin/candidates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newCandidate)
        });
        if (res.ok) {
            setNewCandidate({ name: '', party: '', school: '', position: '' });
            fetchAdminData();
        }
    };

    const handleDeleteCandidate = async (id) => {
        if (!window.confirm("Permanent Action: Delete candidate from server?")) return;
        const token = localStorage.getItem('admin_token');
        await fetch(`${BASE_URL}/admin/candidates/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAdminData();
    };

    const handlePhaseChange = (newPhase) => {
        setElectionPhase(newPhase);
        alert(`System Alert: Election has been moved to the ${newPhase} phase.`);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await adminLogin(creds.username, creds.password);
        setLoading(false);
        if (!res.success) setLoginError(res.message);
    };

    const selectStyle = { backgroundColor: '#1f2937', color: 'white', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px' };

    const filteredVoters = voters.filter(v =>
        (v.admissionNumber && v.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!adminLoggedIn) {
        return (
            <div style={styles.loginCenter}>
                <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '50px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ fontSize: '3.5rem' }}>🛡️</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 15 }}>Commissioner Access</h2>
                        <p className="text-muted">University Election Control</p>
                    </div>
                    {loginError && <div className="alert alert-error">{loginError}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Admin ID</label>
                            <input className="form-input" value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Secret Key</label>
                            <input className="form-input" type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} required />
                        </div>
                        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                            {loading ? 'Waking Server...' : 'Unlock Dashboard'}
                        </button>
                    </form>
                    <button className="btn btn-secondary btn-full" style={{marginTop: '15px'}} onClick={() => onNavigate('home')}>← Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                <div style={{ marginBottom: '30px', fontSize: '1.2rem' }}>🎓 <strong>Uni-Vote Admin</strong></div>

                <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginBottom: '20px', justifyContent: 'center', width: '100%' }}
                    onClick={() => onNavigate('home')}
                >
                    🏠 Exit to Portal
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '20px' }} />

                <button style={tab === 'overview' ? styles.activeTab : styles.tab} onClick={() => setTab('overview')}>📊 Ballot Manager</button>
                <button style={tab === 'voters' ? styles.activeTab : styles.tab} onClick={() => setTab('voters')}>👥 Voter Registry</button>
                <button style={tab === 'control' ? styles.activeTab : styles.tab} onClick={() => setTab('control')}>⚙️ Phase Control</button>

                <div style={{marginTop: 'auto'}}>
                    <button className="btn btn-danger btn-sm btn-full" onClick={adminLogout}>Logout System</button>
                </div>
            </div>

            <div style={styles.main}>
                {tab === 'overview' && (
                    <div className="fade-up">
                        <h1 style={{marginBottom: '30px', fontFamily: 'var(--font-display)'}}>Candidate Infrastructure</h1>
                        <div className="card" style={{marginBottom: '40px'}}>
                            <h3>Commission New Candidate</h3>
                            <form onSubmit={handleAddCandidate}>
                                <div style={styles.candidateForm}>
                                    <input className="form-input" placeholder="Full Name" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
                                    <input className="form-input" placeholder="Party / Slogan" value={newCandidate.party} onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
                                    <select className="form-input" style={selectStyle} value={newCandidate.school} onChange={e => setNewCandidate({...newCandidate, school: e.target.value})} required>
                                        <option value="" style={{background: '#1f2937'}}>Assign School</option>
                                        <option value="Computing" style={{background: '#1f2937'}}>School of Computing</option>
                                        <option value="Business" style={{background: '#1f2937'}}>School of Business</option>
                                        <option value="Engineering" style={{background: '#1f2937'}}>School of Engineering</option>
                                        <option value="Nursing" style={{background: '#1f2937'}}>School of Nursing</option>
                                    </select>
                                    <select className="form-input" style={selectStyle} value={newCandidate.position} onChange={e => setNewCandidate({...newCandidate, position: e.target.value})} required>
                                        <option value="" style={{background: '#1f2937'}}>Select Position</option>
                                        <option value="School Rep" style={{background: '#1f2937'}}>School Rep</option>
                                        <option value="Mens Rep" style={{background: '#1f2937'}}>Mens Rep</option>
                                        <option value="Womens Rep" style={{background: '#1f2937'}}>Womens Rep</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary btn-full" style={{marginTop: '15px'}} type="submit">Publish Candidate to Ballot</button>
                            </form>
                        </div>
                        {candidates.length === 0 && !loading && <p style={{textAlign: 'center', color: 'var(--muted)'}}>No candidates on the ballot yet.</p>}
                        {candidates.map(c => (
                            <div key={c.id} className="card" style={styles.candidateItem}>
                                <div>
                                    <h4 style={{margin: 0, color: 'var(--white)'}}>{c.name}</h4>
                                    <div style={{fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        {c.position || 'General'} | {c.school || 'Universal'}
                                    </div>
                                    <div style={{fontSize: '0.75rem', color: 'var(--muted)'}}>{c.party}</div>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--green)'}}>{c.voteCount}</div>
                                        <div style={{fontSize: '0.6rem', color: 'var(--muted)'}}>VOTES</div>
                                    </div>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCandidate(c.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'voters' && (
                    <div className="fade-up">
                        <h1 style={{marginBottom: '20px', fontFamily: 'var(--font-display)'}}>Voter Registry</h1>
                        <input className="form-input" style={{marginBottom: '20px'}} placeholder="🔍 Search students by name or admission number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <div className="card" style={{padding: 0, overflow: 'hidden'}}>
                            <table style={styles.table}>
                                <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>Student Name</th>
                                    <th style={styles.th}>Admission No</th>
                                    <th style={styles.th}>School</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredVoters.map(v => (
                                    <tr key={v.id} style={styles.tr}>
                                        <td style={styles.td}>{v.name}</td>
                                        <td style={styles.td}><code>{v.admissionNumber}</code></td>
                                        <td style={styles.td}>{v.school}</td>
                                        <td style={styles.td}>{v.hasVoted ? <span className="badge badge-green">VOTED</span> : <span className="badge badge-yellow">PENDING</span>}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'control' && (
                    <div className="fade-up">
                        <h1 style={{marginBottom: '30px', fontFamily: 'var(--font-display)'}}>Phase Control</h1>
                        <div className="card" style={{textAlign: 'center', padding: '60px'}}>
                            <p className="text-muted">Current Status:</p>
                            <h2 style={{fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '40px'}}>{phase.toUpperCase()}</h2>
                            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                                <button className={`btn ${phase === PHASES.REGISTRATION ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePhaseChange(PHASES.REGISTRATION)}>Open Registration</button>
                                <button className={`btn ${phase === PHASES.VOTING ? 'btn-success' : 'btn-secondary'}`} onClick={() => handlePhaseChange(PHASES.VOTING)}>Open Voting</button>
                                <button className={`btn ${phase === PHASES.CLOSED ? 'btn-danger' : 'btn-secondary'}`} onClick={() => handlePhaseChange(PHASES.CLOSED)}>Close Election</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    loginCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--navy)' },
    page: { display: 'flex', minHeight: '100vh', background: 'var(--navy)' },
    sidebar: { width: '260px', background: 'rgba(0,0,0,0.3)', padding: '40px 25px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '50px', overflowY: 'auto' },
    tab: { background: 'none', border: 'none', color: 'var(--muted)', textAlign: 'left', padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '5px', width: '100%' },
    activeTab: { background: 'rgba(240,165,0,0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--accent)', textAlign: 'left', padding: '15px', fontWeight: 'bold', borderRadius: '10px', marginBottom: '5px', width: '100%' },
    candidateForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    candidateItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' },
    th: { textAlign: 'left', padding: '15px', color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '15px', fontSize: '0.9rem' }
};