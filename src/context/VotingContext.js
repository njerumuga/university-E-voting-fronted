import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const VotingContext = createContext();

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/voters' 
    : 'https://university-e-voting-backend.onrender.com/api/voters';

export const PHASES = {
    REGISTRATION: 'registration',
    VOTING: 'voting',
    CLOSED: 'closed',
};

export function VotingProvider({ children }) {
    const [phase, setPhase] = useState(PHASES.REGISTRATION);
    const [candidates, setCandidates] = useState([]);
    const [currentVoter, setCurrentVoter] = useState(null);
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);

    // --- UPDATED: FETCH PHASE FROM DATABASE AS JSON ---
    const fetchElectionPhase = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings/phase`);
            if (res.ok) {
                const data = await res.json(); // Changed from .text() to .json()
                setPhase(data.phase); // Access the 'phase' key from the Map/JSON
            }
        } catch (err) { 
            console.error("Could not sync election phase. Server might be down.", err); 
        }
    }, []);

    // --- UPDATED: SAVE PHASE TO DATABASE ---
    const setElectionPhase = async (newPhase) => {
        setPhase(newPhase); // Update UI immediately for responsiveness
        try {
            await fetch(`${API_BASE_URL}/settings/phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: newPhase }),
            });
        } catch (err) { 
            console.error("Failed to save phase to database", err); 
        }
    };

    const fetchCandidates = useCallback(async (token) => {
        const activeToken = token || localStorage.getItem('voter_token');
        if (!activeToken) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/candidates`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            }
        } catch (err) { console.error("Fetch candidates failed", err); }
    }, []);

    const fetchCurrentVoter = useCallback(async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const voterData = await res.json();
                setCurrentVoter(voterData);
                fetchCandidates(token); 
            } else {
                localStorage.removeItem('voter_token');
                setCurrentVoter(null);
            }
        } catch (err) { console.error("Failed to fetch user profile.", err); }
    }, [fetchCandidates]);

    useEffect(() => {
        fetchElectionPhase(); // Global sync on load
        
        const vToken = localStorage.getItem('voter_token');
        const aToken = localStorage.getItem('admin_token');
        
        if (vToken) fetchCurrentVoter(vToken);
        if (aToken) setAdminLoggedIn(true);
    }, [fetchElectionPhase, fetchCurrentVoter]);

    const registerVoter = async (formData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.fullName,
                    admissionNumber: formData.admissionNumber,
                    email: formData.email,
                    school: formData.school,
                    course: formData.course,
                    yearOfStudy: formData.year,
                    password: formData.password
                }),
            });
            return { success: response.ok };
        } catch (err) { return { success: false, message: 'Server unreachable.' }; }
    };

    const loginVoter = async (admissionNumber, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumber, password }),
            });
            if (response.ok) {
                const token = await response.text();
                localStorage.setItem('voter_token', token);
                await fetchCurrentVoter(token);
                return { success: true };
            }
            return { success: false, message: 'Invalid credentials.' };
        } catch (err) { return { success: false, message: 'Connection error.' }; }
    };

    const adminLogin = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNumber: username, password }),
            });
            if (response.ok) {
                const token = await response.text();
                localStorage.setItem('admin_token', token);
                setAdminLoggedIn(true);
                return { success: true };
            }
            return { success: false, message: 'Invalid admin credentials.' };
        } catch (err) { return { success: false, message: 'Server error.' }; }
    };

    const castVote = async (payload) => {
        const token = localStorage.getItem('voter_token');
        const candidateId = payload.selection || payload.candidateId;
        try {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ candidateId: parseInt(candidateId) }),
            });
            if (response.ok) {
                setCurrentVoter(prev => ({ ...prev, hasVoted: true }));
                fetchCandidates(token); // Refresh local tally after voting
                return { success: true };
            }
            return { success: false };
        } catch (err) { return { success: false }; }
    };

    const adminLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('voter_token');
        setAdminLoggedIn(false);
        setCurrentVoter(null);
    };

    return (
        <VotingContext.Provider value={{
            phase, setElectionPhase, candidates, currentVoter, adminLoggedIn,
            registerVoter, loginVoter, adminLogin, castVote, adminLogout
        }}>
            {children}
        </VotingContext.Provider>
    );
}

export const useVoting = () => useContext(VotingContext);