import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const VotingContext = createContext();
const API_BASE_URL = 'http://localhost:8080/api'; 

export const PHASES = { REGISTRATION: 'registration', VOTING: 'voting', CLOSED: 'closed' };

export function VotingProvider({ children }) {
    const [phase, setPhase] = useState(PHASES.REGISTRATION);
    const [candidates, setCandidates] = useState([]);
    const [user, setUser] = useState(null); 
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);

    const restoreUser = useCallback(async (token) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/voters/me`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                localStorage.clear();
            }
        } catch (err) { console.error("Session restore failed"); }
    }, []);

    const fetchElectionStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/voters/settings/phase`); 
            if (res.ok) {
                const data = await res.json();
                if (data.phase) setPhase(data.phase.toLowerCase());
            }
        } catch (err) { console.error("Phase fetch failed"); }
    }, []);

    const fetchCandidates = useCallback(async () => {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('voter_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        try {
            const res = await fetch(`${API_BASE_URL}/candidates`, { headers });
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
            }
        } catch (err) { console.error("Candidates fetch failed"); }
    }, []);

    const fetchMyCandidates = useCallback(async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/voters/candidates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
            }
        } catch (err) { console.error("School filter failed"); }
    }, []);

    const registerVoter = async (formData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/voters/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.fullName || formData.name,
                    admissionNumber: formData.admissionNumber,
                    email: formData.email || `${formData.admissionNumber}@univote.com`,
                    school: formData.school || "General",
                    course: formData.course || "N/A",
                    yearOfStudy: formData.year ? formData.year.toString() : "1",
                    password: formData.password,
                    // Send both to ensure Java maps the boolean correctly
                    isAdmin: formData.isAdmin === true,
                    admin: formData.isAdmin === true 
                }),
            });
            if (res.ok) return { success: true };
            const errorMsg = await res.text();
            return { success: false, message: errorMsg };
        } catch (err) { return { success: false, message: "Server connection error" }; }
    };

    const loginVoter = async (admissionNumber, password) => {
        try {
            const res = await fetch(`${API_BASE_URL}/voters/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumber, password }),
            });
            if (res.ok) {
                const token = await res.text();
                localStorage.setItem('voter_token', token);
                await restoreUser(token);
                await fetchMyCandidates(token);
                return { success: true };
            }
            return { success: false, message: "Invalid Credentials" };
        } catch (err) { return { success: false, message: "Server error" }; }
    };

    const adminLogin = async (username, password) => {
        try {
            const res = await fetch(`${API_BASE_URL}/voters/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumber: username, password }),
            });
            if (res.ok) {
                const token = await res.text();
                localStorage.setItem('admin_token', token);
                setAdminLoggedIn(true);
                await restoreUser(token);
                await fetchCandidates();
                return { success: true };
            }
            return { success: false };
        } catch (err) { return { success: false }; }
    };

    const castVote = async (voteData) => {
        const token = localStorage.getItem('voter_token');
        if (!token) return { success: false, message: "Session expired." };
        try {
            const res = await fetch(`${API_BASE_URL}/voters/vote`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ candidateId: voteData.candidateId })
            });
            if (res.ok) return { success: true };
            const errorText = await res.text();
            return { success: false, message: errorText || "Vote rejected." };
        } catch (err) { return { success: false, message: "Server unreachable" }; }
    };

    const setElectionPhase = async (newPhase) => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/voters/settings/phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ phase: newPhase })
            });
            if (res.ok) {
                setPhase(newPhase.toLowerCase());
                return true;
            }
            return false;
        } catch (err) { return false; }
    };

    const resetElection = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/voters/admin/reset-election`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchElectionStatus();
                await fetchCandidates();
                return { success: true };
            }
            return { success: false };
        } catch (err) { return { success: false }; }
    };

    const adminLogout = () => {
        localStorage.clear();
        setAdminLoggedIn(false);
        setUser(null);
        window.location.reload(); 
    };

    useEffect(() => {
        fetchElectionStatus();
        const aToken = localStorage.getItem('admin_token');
        const vToken = localStorage.getItem('voter_token');
        if (aToken) {
            setAdminLoggedIn(true);
            restoreUser(aToken);
            fetchCandidates();
        } else if (vToken) {
            restoreUser(vToken);
            fetchMyCandidates(vToken);
        } else {
            fetchCandidates();
        }
    }, [fetchCandidates, fetchElectionStatus, restoreUser, fetchMyCandidates]);

    return (
        <VotingContext.Provider value={{
            phase, candidates, user, adminLoggedIn, 
            adminLogin, adminLogout, loginVoter, fetchCandidates, 
            setElectionPhase, resetElection, registerVoter, fetchMyCandidates, castVote
        }}>
            {children}
        </VotingContext.Provider>
    );
}

export const useVoting = () => useContext(VotingContext);