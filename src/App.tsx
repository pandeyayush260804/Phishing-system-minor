import { useState } from 'react';
import FrontPage from './components/FrontPage';
import Dashboard from './components/Dashboard';

type View = 'frontpage' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('frontpage');

  const handleEnterDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleExitDashboard = () => {
    setCurrentView('frontpage');
  };

  return (
    <>
      {currentView === 'frontpage' && (
        <FrontPage onEnter={handleEnterDashboard} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard onLogout={handleExitDashboard} />
      )}
    </>
  );
}

export default App;