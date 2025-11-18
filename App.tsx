import React, { useState } from 'react';
import { HabitProvider, useHabitStore } from './hooks/useHabitStore';
import BottomNav from './components/BottomNav';
import TodayView from './components/views/TodayView';
import HabitsView from './components/views/HabitsView';
import MoodView from './components/views/MoodView';
import MealsView from './components/views/MealsView';
import JournalView from './components/views/JournalView';
import MonthlyView from './components/views/MonthlyView';
import WelcomeView from './components/views/WelcomeView';
import ReligiousHabitsView from './components/views/ReligiousHabitsView';
import { Page } from './types';

const AppContent: React.FC = () => {
  const { userName } = useHabitStore();
  const [activePage, setActivePage] = useState<Page>('today');

  if (!userName) {
    return <WelcomeView />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'today':
        return <TodayView />;
      case 'habits':
        return <HabitsView />;
      case 'religious':
        return <ReligiousHabitsView />;
      case 'mood':
        return <MoodView />;
      case 'meals':
        return <MealsView />;
      case 'journal':
        return <JournalView />;
      case 'monthly':
        return <MonthlyView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-creamy text-dark-green pb-24">
      <div className="container mx-auto p-4 max-w-lg">
        {renderContent()}
      </div>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
};

export default App;
