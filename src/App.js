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

    // Unified navigation function passed to all children
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

    /**
     * WEB DNA RULE:
     * Pages like Admin, Vote, and Results now utilize a Sidebar.
     * We use 'dashboard-layout' for these to remove the centering constraints 
     * and allow the Sidebar to take its natural 100% height.
     */
    const isDashboardView = ['admin', 'vote', 'results'].includes(page);

    return (
        <VotingProvider>
            <div className={`app-root ${isDashboardView ? 'dashboard-layout' : 'portal-layout'}`}>
                {/* The Sidebar is rendered INSIDE the specific pages (AdminPage, VotingPage) 
                   to allow different buttons for different users, while 'page-container'
                   ensures smooth full-screen transitions.
                */}
                <div className="page-container">
                    {renderPage()}
                </div>
            </div>
        </VotingProvider>
    );
}