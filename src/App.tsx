import { useState } from 'react';
import FrontPage from './components/FrontPage';
import Dashboard from './components/Dashboard';

type Page = 'frontpage' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('frontpage');

  const handleEnterDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentPage('frontpage');
  };

  return (
    <>
      {currentPage === 'frontpage' && <FrontPage onEnter={handleEnterDashboard} />}
      {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
    </>
  );
}

export default App;
