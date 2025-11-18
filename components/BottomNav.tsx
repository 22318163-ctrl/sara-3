import React from 'react';
import { Page } from '../types';
import { ICONS } from '../constants';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ page, label, icon: Icon, isActive, onClick }) => {
  const activeClass = isActive ? 'text-dark-green' : 'text-pastel-green';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeClass}`}
    >
      <Icon className="h-6 w-6 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
    { page: 'today', label: 'اليوم', icon: ICONS.today },
    { page: 'habits', label: 'العادات', icon: ICONS.habits },
    { page: 'religious', label: 'ديني', icon: ICONS.religious },
    { page: 'mood', label: 'المزاج', icon: ICONS.mood },
    { page: 'meals', label: 'الوجبات', icon: ICONS.meals },
    { page: 'journal', label: 'مساحتي', icon: ICONS.journal },
    { page: 'monthly', label: 'حصاد الشهر', icon: ICONS.monthly },
  ];

  return (
    <nav className="fixed bottom-0 right-0 left-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] max-w-lg mx-auto rounded-t-2xl">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map(item => (
          <NavItem
            key={item.page}
            page={item.page}
            label={item.label}
            icon={item.icon}
            isActive={activePage === item.page}
            onClick={() => setActivePage(item.page)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
