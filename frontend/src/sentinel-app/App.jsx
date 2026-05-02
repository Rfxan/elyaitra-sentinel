import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AttackerIntelligence from './components/AttackerIntelligence';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AlertHistory from './components/AlertHistory';
import TrafficFeed from './components/TrafficFeed';
import ModelVersions from './components/ModelVersions';
import SIEMLog from './components/SIEMLog';
import BlockList from './components/BlockList';
import HealthView from './components/HealthView';
import ThreatView from './components/ThreatView';
import { default as EmptyState } from './components/EmptyState';
import ForensicsView from './components/ForensicsView';
import RedTeamView from './components/RedTeamView';
import IntegrityView from './components/IntegrityView';
import RoomsView from './components/RoomsView';
import { AlertProvider, useAlerts } from './hooks/useAlerts';
import FlashOverlay from './components/FlashOverlay';
import ToastContainer from './components/ToastContainer';
import AttackChart from './components/AttackChart';
import AdversarialSimulator from './components/AdversarialSimulator';
import IncidentDashboard from './components/IncidentDashboard';
import ClusterAnalysis from './components/ClusterAnalysis';
import './sentinel.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-white dark:bg-black min-h-screen">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 border border-red-500">{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeItem, setActiveItem] = useState('Dashboards');
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeItem]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Hotkey combo tracker (e.g. G then D)
      if (e.key === 'g' || e.key === 'G') {
        const nextKeyHandler = (ne) => {
          if (ne.key === 'd' || ne.key === 'D') setActiveItem('Dashboards');
          if (ne.key === 'f' || ne.key === 'F') setActiveItem('Forensics');
          if (ne.key === 't' || ne.key === 'T') setActiveItem('Threat Feed');
          window.removeEventListener('keydown', nextKeyHandler);
        };
        window.addEventListener('keydown', nextKeyHandler, { once: true });
        setTimeout(() => window.removeEventListener('keydown', nextKeyHandler), 1000);
      }
      
      // Global Search shortcut Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveItem('Threat Feed');
        // Small delay to allow component mount if needed
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search IP"]');
          if (searchInput) searchInput.focus();
        }, 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const globalDataStr = useAlerts();

  return (
    <div className="flex font-sans min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-[#c9d1d9]">
      <FlashOverlay />
      <ToastContainer />
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content wrapper */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex flex-col relative min-h-screen min-w-0`}>
        <Topbar 
          isLive={globalDataStr.isLive} 
          theme={theme} 
          setTheme={setTheme} 
          activeItem={activeItem} 
          setActiveItem={setActiveItem} 
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-6 relative flex flex-col bg-slate-50 dark:bg-[#0b1120] min-w-0 overflow-x-hidden">
          {activeItem === 'Dashboards' ? (
            <Dashboard data={globalDataStr} />
          ) : activeItem === 'Forensics' ? (
            <ForensicsView />
          ) : activeItem === 'Red Team' ? (
            <RedTeamView />
          ) : activeItem === 'Integrity' ? (
            <IntegrityView />
          ) : activeItem === 'Incidents' ? (
            <IncidentDashboard />
          ) : activeItem === 'Intelligence' ? (
            <AttackerIntelligence />
          ) : activeItem === 'Clustering' ? (
            <ClusterAnalysis />
          ) : activeItem === 'Threat Feed' || activeItem === 'Traffic' ? (
            <TrafficFeed />
          ) : activeItem === 'Alerts' ? (
            <AlertHistory />
          ) : activeItem === 'Threat' ? (
            <ThreatView />
          ) : activeItem === 'Attack' ? (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-10">
              <div className="h-[500px] shrink-0">
                <AttackChart />
              </div>
              <AdversarialSimulator />
            </div>
          ) : activeItem === 'Versions' ? (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
              <ModelVersions />
            </div>
          ) : activeItem === 'SIEM Log' ? (
            <SIEMLog />
          ) : activeItem === 'Block List' ? (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
              <BlockList />
            </div>
          ) : activeItem === 'Health' ? (
            <HealthView />
          ) : activeItem === 'Rooms' ? (
            <RoomsView />
          ) : (
            <div className="flex-1 glass-card flex items-center justify-center min-h-[60vh] mt-4">
              <EmptyState
                message={`${activeItem} Module Offline`}
                subMessage="This module is currently disabled or undergoing maintenance. Please return to Dashboards."
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <MainApp />
      </AlertProvider>
    </ErrorBoundary>
  );
}

export default App;
