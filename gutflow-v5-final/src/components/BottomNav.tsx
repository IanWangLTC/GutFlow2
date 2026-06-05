import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Search, Settings } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: '概览', icon: LayoutDashboard },
  { to: '/', label: '日记', icon: CalendarDays },
  { to: '/foods', label: '食物', icon: Search },
  { to: '/settings', label: '设置', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid #38383A' }}>
      <div className="max-w-md mx-auto flex h-16 items-center justify-around">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end className={({ isActive }) => `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-[#00D4AA]' : 'text-[#8E8E93]'}`}>
            <t.icon size={22} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
