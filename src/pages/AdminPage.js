import React, { useState, useEffect, useCallback } from 'react';
import { useVoting, PHASES } from '../context/VotingContext';

export default function AdminPage({ onNavigate }) {
    const { 
        adminLoggedIn, adminLogin, adminLogout, 
        phase, setElectionPhase, candidates, 
        fetchCandidates, registerVoter, resetElection 
    } = useVoting();
    
    const [voters, setVoters] = useState([]);
    const [tab, setTab] = useState('overview'); 
    const [loading, setLoading] = useState(false);
    const [creds, setCreds] = useState({ username: '', password: '' });
    
    const [showAddCandidate, setShowAddCandidate] = useState(false);
    const [newCandidate, setNewCandidate] = useState({ name: '', party: '', school: '', position: '' });
    const [newAdmin, setNewAdmin] = useState({ name: '', admissionNumber: '', password: '', school: 'Administration' });

    const BASE_URL = 'http://localhost:8080/api';

    // Fetch all registry data from the database
    const refreshData = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        setLoading(true);
        await fetchCandidates();
        try {
            const vRes = await fetch(`${BASE_URL}/admin/voters`, { 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
            });
            if (vRes.ok) {
                const data = await vRes.json();
                setVoters(data);
            }
        } catch (err) { console.error("Registry fetch failed", err); }
        setLoading(false);
    }, [fetchCandidates]);

    useEffect(() => { if (adminLoggedIn) refreshData(); }, [adminLoggedIn, refreshData]);

    const handleDeleteCandidate = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const token = localStorage.getItem('admin_token');
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/admin/candidates/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Deleted successfully");
                await refreshData();
            }
        } catch (err) { alert("Network error"); }
        setLoading(false);
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // This ensures the new user is saved with Admin privileges in the DB
        const res = await registerVoter({ 
            fullName: newAdmin.name, 
            admissionNumber: newAdmin.admissionNumber, 
            password: newAdmin.password, 
            school: 'Administration',
            isAdmin: true 
        });

        if (res.success) {
            alert("New Admin Authorized! Access granted for " + newAdmin.admissionNumber);
            setNewAdmin({ name: '', admissionNumber: '', password: '', school: 'Administration' });
            await refreshData(); 
        } else { 
            alert("Error: " + res.message); 
        }
        setLoading(false);
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`${BASE_URL}/admin/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newCandidate, voteCount: 0 })
            });
            if (res.ok) {
                await fetchCandidates(); 
                setNewCandidate({ name: '', party: '', school: '', position: '' });
                setShowAddCandidate(false); 
                alert("Candidate added!");
            }
        } catch (err) { alert("Backend unreachable"); }
        setLoading(false);
    };

    const groupedCandidates = candidates.reduce((acc, curr) => {
        if (!acc[curr.position]) acc[curr.position] = [];
        acc[curr.position].push(curr);
        return acc;
    }, {});

    // Helper: Identify admins by checking all possible naming conventions from Backend/DB
    const systemAdmins = voters.filter(v => v.isAdmin === true || v.is_admin === true || v.admin === true);

    if (!adminLoggedIn) {
        return (
            <div style={styles.loginCenter}>
                <div className="glass-card" style={{ width: '400px', padding: '40px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>🛡️ Admin Panel</h2>
                    <form onSubmit={(e) => { e.preventDefault(); adminLogin(creds.username, creds.password); }}>
                        <input className="form-input" style={{marginBottom: 15}} placeholder="Admin ID" onChange={e => setCreds({...creds, username: e.target.value})} required />
                        <input className="form-input" style={{marginBottom: 20}} type="password" placeholder="Secret Key" onChange={e => setCreds({...creds, password: e.target.value})} required />
                        <button className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                            {loading ? 'Verifying...' : 'Unlock Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.layout}>
            <aside style={styles.sidebar}>
                <div style={{ marginBottom: '40px' }}><h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Uni-Vote Admin</h2></div>
                <button style={tab === 'overview' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('overview')}>📊 Overview</button>
                <button style={tab === 'voters' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('voters')}>👥 Voters</button>
                <button style={tab === 'candidates' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('candidates')}>🎭 Candidates</button>
                <button style={tab === 'results' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('results')}>📈 Results</button>
                <button style={tab === 'control' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('control')}>⚙️ Control</button>
                <button style={tab === 'admins' ? {...styles.navBtn, ...styles.activeTab} : styles.navBtn} onClick={() => setTab('admins')}>🛡️ Admins</button>
                <div style={{ marginTop: 'auto' }}><button className="btn btn-primary btn-full" style={{background: '#ffcc00', color: '#000'}} onClick={adminLogout}>LOGOUT</button></div>
            </aside>

            <main style={styles.mainContent}>
                {tab === 'overview' && (
                    <div className="fade-up">
                        <h1>Overview</h1>
                        <div style={styles.grid}>
                            <div className="glass-card" style={styles.statBox}><h3>{voters.length}</h3><small>TOTAL REGISTERED</small></div>
                            <div className="glass-card" style={styles.statBox}><h3>{voters.filter(v => v.hasVoted).length}</h3><small>VOTES CAST</small></div>
                            <div className="glass-card" style={styles.statBox}><h3>{systemAdmins.length}</h3><small>ACTIVE ADMINS</small></div>
                        </div>
                    </div>
                )}

                {tab === 'voters' && (
                    <div className="fade-up">
                        <h1>Voter Registry</h1>
                        <div className="glass-card" style={{marginTop: 20}}>
                            {voters.filter(v => !v.isAdmin && !v.is_admin).map(v => (
                                <div key={v.id} style={styles.listItem}>
                                    <div><strong>{v.name}</strong><br/><small>{v.admissionNumber}</small></div>
                                    <div style={{color: v.hasVoted ? '#00ff88' : '#ff4444'}}>{v.hasVoted ? '✓ Voted' : '○ Not Voted'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'candidates' && (
                    <div className="fade-up">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25}}>
                            <h1>Candidates ({candidates.length})</h1>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddCandidate(true)}>+ ADD NEW</button>
                        </div>
                        <div className="glass-card" style={{padding: '10px'}}>
                            {candidates.map(c => {
                                const displayVotes = c.voteCount !== undefined ? c.voteCount : (c.vote_count || 0);
                                return (
                                    <div key={c.id} style={styles.listItem}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                            <div style={{width: '4px', height: '35px', background: '#00ff88', borderRadius: '2px'}} />
                                            <div>
                                                <h4 style={{margin: 0}}>{c.name}</h4>
                                                <small style={{opacity: 0.6}}>{c.position} | {c.party} | {c.school}</small>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                            <div style={{textAlign: 'right'}}><small style={{fontSize: '0.6rem'}}>VOTES</small><br/><strong>{displayVotes}</strong></div>
                                            <button onClick={() => handleDeleteCandidate(c.id)} style={{background: 'rgba(255, 68, 68, 0.2)', border: 'none', color: '#ff4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'}}>🗑️</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'results' && (
                    <div className="fade-up">
                        <h1>Election Results</h1>
                        {Object.keys(groupedCandidates).map(pos => {
                            const totalVotes = groupedCandidates[pos].reduce((sum, c) => sum + (c.voteCount || c.vote_count || 0), 0);
                            return (
                                <div key={pos} className="glass-card" style={{padding: '20px', marginBottom: '20px'}}>
                                    <h3 style={{marginBottom: '15px'}}>{pos} ({totalVotes} votes)</h3>
                                    {groupedCandidates[pos].map(cand => {
                                        const cVotes = cand.voteCount || cand.vote_count || 0;
                                        const pct = totalVotes > 0 ? Math.round((cVotes / totalVotes) * 100) : 0;
                                        return (
                                            <div key={cand.id} style={{marginBottom: '15px'}}>
                                                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}><span>{cand.name}</span><span>{pct}%</span></div>
                                                <div style={styles.progressBg}><div style={{...styles.progressFill, width: `${pct}%`}} /></div>
                                                <small style={{opacity: 0.5}}>{cVotes} votes</small>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === 'control' && (
                    <div className="fade-up">
                        <h1>Phase Control</h1>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
                            {[PHASES.REGISTRATION, PHASES.VOTING, PHASES.CLOSED].map(p => (
                                <div key={p} className="glass-card" style={{...styles.phaseItem, border: phase === p ? '2px solid #ffcc00' : '1px solid rgba(255,255,255,0.1)'}}>
                                    <div style={{textTransform: 'capitalize'}}><strong>{p} Phase</strong></div>
                                    <button className={`btn ${phase === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setElectionPhase(p)}>
                                        {phase === p ? 'Active' : 'Activate'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '80px', borderTop: '1px solid rgba(255, 68, 68, 0.3)', paddingTop: '30px' }}>
                            <h3 style={{ color: '#ff4444', fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>⚠️ DANGER ZONE</h3>
                            <button className="btn" style={{background: '#ff4444', color: 'white', width: '100%', padding: '20px', fontWeight: '900', borderRadius: '12px'}}
                                onClick={async () => {
                                    if (window.confirm("FINAL WARNING: Wipe ALL current votes?")) {
                                        const res = await resetElection();
                                        if (res.success) { alert("Success!"); window.location.reload(); }
                                    }
                                }}>🔄 RESET ENTIRE ELECTION</button>
                        </div>
                    </div>
                )}

                {tab === 'admins' && (
                    <div className="fade-up">
                        <h1>Admin Management</h1>
                        
                        <div className="glass-card" style={{padding: '25px', marginBottom: '30px'}}>
                            <h3 style={{marginBottom: '15px'}}>Authorize New System Admin</h3>
                            <form onSubmit={handleAddAdmin} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                <input className="form-input" placeholder="Full Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required />
                                <input className="form-input" placeholder="Admin ID / admission" value={newAdmin.admissionNumber} onChange={e => setNewAdmin({...newAdmin, admissionNumber: e.target.value})} required />
                                <input className="form-input" type="password" placeholder="System Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
                                <button className="btn btn-primary" disabled={loading} style={{marginTop: '10px'}}>
                                    {loading ? 'Processing...' : 'GRANT ADMIN ACCESS'}
                                </button>
                            </form>
                        </div>

                        <div className="fade-up" style={{marginTop: '40px'}}>
                            <h2 style={{marginBottom: '20px'}}>Current System Administrators ({systemAdmins.length})</h2>
                            <div className="glass-card">
                                {systemAdmins.length > 0 ? (
                                    systemAdmins.map(admin => (
                                        <div key={admin.id} style={styles.listItem}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                                <div style={{width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,204,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffcc00', fontWeight: 'bold'}}>
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>{admin.name}</strong><br/>
                                                    <small style={{opacity: 0.6}}>{admin.admissionNumber || admin.admission_number}</small>
                                                </div>
                                            </div>
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(0,255,136,0.2)'}}>
                                                    ✓ SYSTEM ADMIN
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{padding: '30px', textAlign: 'center', opacity: 0.5}}>No system admins found in database.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showAddCandidate && (
                <div style={styles.modalOverlay}>
                    <div className="glass-card" style={{padding: '30px', width: '400px'}}>
                        <h2 style={{color: 'white'}}>Add Candidate</h2>
                        <form onSubmit={handleAddCandidate} style={{display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15}}>
                            <input className="form-input" placeholder="Name" onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
                            <input className="form-input" placeholder="Party" onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
                            <input className="form-input" placeholder="Faculty" onChange={e => setNewCandidate({...newCandidate, school: e.target.value})} required />
                            <input className="form-input" placeholder="Position" onChange={e => setNewCandidate({...newCandidate, position: e.target.value})} required />
                            <div style={{display: 'flex', gap: 10}}>
                                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowAddCandidate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-full">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: 'var(--primary-green)' },
    sidebar: { width: '280px', padding: '40px 25px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--glass-border)', position: 'sticky', top: 0, height: '100vh' },
    mainContent: { flex: 1, padding: '60px 40px', overflowY: 'auto', color: 'white' },
    navBtn: { background: 'none', border: 'none', color: 'white', padding: '15px', textAlign: 'left', cursor: 'pointer', borderRadius: '12px', opacity: 0.6, fontSize: '0.9rem', marginBottom: 5, width: '100%' },
    activeTab: { background: 'rgba(255,255,255,0.1)', color: 'var(--accent-gold)', fontWeight: 'bold', opacity: 1 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
    statBox: { textAlign: 'center', padding: '20px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    progressBg: { background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', margin: '8px 0', overflow: 'hidden' },
    progressFill: { background: '#ffcc00', height: '100%', borderRadius: '4px' },
    phaseItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    loginCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--primary-green)' }
};