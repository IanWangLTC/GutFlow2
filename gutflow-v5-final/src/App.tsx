import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DiaryPage from './pages/DiaryPage';
import FoodSearch from './pages/FoodSearch';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import { db } from './lib/db';
import { seedDemoData } from './lib/demoData';

function App() {
  useEffect(() => { seedDemoData(db); }, []);
  return (
    <HashRouter>
      <div className="max-w-md mx-auto pb-20 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diary/:date" element={<DiaryPage />} />
          <Route path="/foods" element={<FoodSearch />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  );
}
export default App;
