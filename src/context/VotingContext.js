import React, { createContext, useContext, useState, useEffect } from 'react';

const VotingContext = createContext();

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/voters' // Added /voters here
    : 'https://university-e-voting-backend.onrender.com/api/voters'; // Added /voters here

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

    useEffect(() => {
        const vToken = localStorage.getItem('voter_token');
        const aToken = localStorage.getItem('admin_token');
        if (vToken) fetchCurrentVoter(vToken);
        if (aToken) setAdminLoggedIn(true);
    }, []);

    const fetchCandidates = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/candidates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            }
        } catch (err) { console.error("Fetch candidates failed", err); }
    };

    const fetchCurrentVoter = async (token) => {
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
    };

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
            if (response.ok) return { success: true };
            const errorText = await response.text();
            return { success: false, message: errorText || 'Registration failed.' };
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
                // We check if the response actually contains a token
                localStorage.setItem('admin_token', token);
                setAdminLoggedIn(true);
                return { success: true };
            }
            return { success: false, message: 'Invalid admin credentials.' };
        } catch (err) { return { success: false, message: 'Server error.' }; }
    };

    return (
        <VotingContext.Provider value={{
            phase, setElectionPhase: setPhase, candidates, currentVoter, adminLoggedIn,
            registerVoter, loginVoter, adminLogin,
            castVote: async (payload) => {
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
                        return { success: true };
                    }
                    return { success: false, message: 'Voting failed.' };
                } catch (err) { return { success: false, message: 'Server error.' }; }
            },
            adminLogout: () => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('voter_token');
                setAdminLoggedIn(false);
                setCurrentVoter(null);
            }
        }}>
            {children}
        </VotingContext.Provider>
    );
}

export const useVoting = () => useContext(VotingContext);