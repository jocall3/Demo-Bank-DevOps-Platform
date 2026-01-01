import React from 'react';
import DemoBankDevOpsView from './components/DemoBankDevOpsView';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <DemoBankDevOpsView />
      </div>
    </div>
  );
};

export default App;