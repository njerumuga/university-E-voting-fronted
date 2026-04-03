# EduVote — Student E-Voting System

A full React frontend for a student e-voting system with registration, voting, real-time results, and admin dashboard.

## Features
- ✅ Student voter registration with admission numbers
- 🔒 One vote per student (duplicate voting completely blocked)
- 📱 Mobile-friendly (works on Android phones)
- 📊 Real-time live results
- 🛡️ Admin dashboard with full vote management
- 📥 CSV export for voter and results reports
- ⚙️ Election phase control (Registration → Voting → Closed)

## Candidates & Positions
Pre-loaded with:
- **President** — 2 candidates
- **Vice President** — 2 candidates
- **Secretary General** — 2 candidates

(Easily expandable in `src/context/VotingContext.js`)

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:3000

## Admin Access
- URL: Click "Admin Dashboard" on the home page
- Username: `admin`
- Password: `admin2024`

## How It Works

### Flow
1. Admin opens **Registration Phase**
2. Students register with name, admission number, email, course, year
3. Admin switches to **Voting Phase** — registration closes automatically
4. Students login with admission number + name, cast ballot
5. Once voted, the system locks — cannot vote again
6. Admin closes election, exports results

### Anti-Duplicate Logic
- Each voter record has a `hasVoted` flag
- On login during voting, the system checks this flag
- If already voted → access denied with clear message
- The ballot submit flow includes a confirmation step before finalizing

## Data Storage
Uses browser `localStorage` — data persists across page refreshes.
For production, connect to a backend API.

## Project Structure
```
src/
  context/VotingContext.js   — Global state (voters, votes, phase)
  pages/
    LandingPage.js           — Home
    RegisterPage.js          — Voter registration
    VoterLoginPage.js        — Login to vote
    VotingPage.js            — Ballot casting
    ResultsPage.js           — Live results
    AdminPage.js             — Admin dashboard
  App.js                     — Router
  index.css                  — Design system / global styles
```
