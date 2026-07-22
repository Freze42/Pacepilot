import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Training from './components/Training';
import Progress from './components/Progress';
import TrainingPlans from './components/TrainingPlans';
import SocialFeed from './components/SocialFeed';
import GearTracker from './components/GearTracker';
import CoachingAI from './components/CoachingAI';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

import { 
  INITIAL_USER, 
  SEEDED_RUNS, 
  MOCK_ACTIVITIES, 
  getScheduleForProgram 
} from './data/mockData';

export default function App() {
  // 1. Core States with persistent storage syncing
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('user');
    return local ? JSON.parse(local) : null; // null triggers login first
  });

  const [runs, setRuns] = useState(() => {
    const local = localStorage.getItem('runs');
    return local ? JSON.parse(local) : SEEDED_RUNS;
  });

  const [feed, setFeed] = useState(() => {
    const local = localStorage.getItem('feed');
    return local ? JSON.parse(local) : MOCK_ACTIVITIES;
  });

  const [shoes, setShoes] = useState(() => {
    const local = localStorage.getItem('shoes');
    if (local) return JSON.parse(local);
    // Fallback to user shoes if initialized
    return INITIAL_USER.shoes;
  });

  const [schedules, setSchedules] = useState(() => {
    const local = localStorage.getItem('schedules');
    if (local) return JSON.parse(local);
    // If we have an active program initially, seed week schedules for week 3
    if (INITIAL_USER.activeProgramId) {
      return getScheduleForProgram(INITIAL_USER.activeProgramId, INITIAL_USER.level, INITIAL_USER.currentWeek);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Syncing states into localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('runs', JSON.stringify(runs));
  }, [runs]);

  useEffect(() => {
    localStorage.setItem('feed', JSON.stringify(feed));
  }, [feed]);

  useEffect(() => {
    localStorage.setItem('shoes', JSON.stringify(shoes));
  }, [shoes]);

  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Auth Handling
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShoes(loggedInUser.shoes || INITIAL_USER.shoes);
    
    // Seed default schedule if not present and program active
    if (loggedInUser.activeProgramId) {
      const scheduleLocal = localStorage.getItem('schedules');
      if (scheduleLocal && JSON.parse(scheduleLocal).length > 0) {
        setSchedules(JSON.parse(scheduleLocal));
      } else {
        const generated = getScheduleForProgram(loggedInUser.activeProgramId, loggedInUser.level, loggedInUser.currentWeek || 1);
        setSchedules(generated);
      }
    } else {
      setSchedules([]);
    }
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSchedules([]);
    localStorage.removeItem('user');
    localStorage.removeItem('schedules');
  };

  // Helper to add activity feed from completes
  const addActivityFeed = (newFeedItem) => {
    const updatedFeed = [newFeedItem, ...feed];
    setFeed(updatedFeed);
    localStorage.setItem('feed', JSON.stringify(updatedFeed));
  };

  // Render panel based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard runs={runs} user={user} />;
      case 'training':
        return <Training runs={runs} />;
      case 'progress':
        return <Progress />;
      case 'plans':
        return (
          <TrainingPlans 
            user={user} 
            setUser={setUser} 
            runs={runs} 
            setRuns={setRuns} 
            schedules={schedules} 
            setSchedules={setSchedules}
            addActivityFeed={addActivityFeed}
          />
        );
      case 'coaching':
        return <CoachingAI user={user} runs={runs} />;
      case 'social':
        return <SocialFeed user={user} feed={feed} setFeed={setFeed} />;
      case 'gear':
        return <GearTracker shoes={shoes} setShoes={setShoes} user={user} setUser={setUser} />;
      case 'admin':
        return <AdminPanel user={user} setUser={setUser} />;
      default:
        return <Dashboard runs={runs} user={user} />;
    }
  };

  // Render AuthModal if not logged in
  if (!user) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        
        {/* Top Header Row */}
        <Header 
          activeTab={activeTab} 
          user={user} 
          setUser={setUser} 
          shoes={shoes} 
        />

        {/* Dynamic Inner Tab View */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
