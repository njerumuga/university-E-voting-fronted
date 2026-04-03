import React, { useState } from 'react';
import { VotingProvider } from './context/VotingContext';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import VoterLoginPage from './pages/VoterLoginPage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import './index.css';

export default function App() {
    const [page, setPage] = useState('home');

    // Unified navigation function passed to all components
    const navigate = (dest) => setPage(dest);

    const renderPage = () => {
        switch (page) {
            case 'home':     return <LandingPage onNavigate={navigate} />;
            case 'register': return <RegisterPage onNavigate={navigate} />;
            case 'login':    return <VoterLoginPage onNavigate={navigate} />;
            case 'vote':     return <VotingPage onNavigate={navigate} />;
            case 'results':  return <ResultsPage onNavigate={navigate} />;
            case 'admin':    return <AdminPage onNavigate={navigate} />;
            default:         return <LandingPage onNavigate={navigate} />;
        }
    };

    return (
        <VotingProvider>
            <div className="app-container">
                {renderPage()}
            </div>
        </VotingProvider>
    );
}