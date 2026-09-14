import { DashboardLayout } from './components/layout/DashboardLayout';
import { DataUploader } from './components/data-input/DataUploader';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { DataTableView } from './components/dashboard/DataTableView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsModal } from './components/layout/SettingsModal';
import { useDataStore } from './store/useDataStore';

import { motion } from 'motion/react';

function App() {
  const { dataset, currentPage } = useDataStore();

  const renderPage = () => {
    if (dataset.length === 0) return <DataUploader />;

    switch (currentPage) {
      case 'overview': return <DynamicDashboard />;
      case 'analytics': return <AnalyticsView />;
      case 'data-table': return <DataTableView />;
      case 'reports': return <ReportsView />;
      default: return <DynamicDashboard />;
    }
  };

  return (
    <DashboardLayout>
      <SettingsModal />
      <motion.div
        key={dataset.length === 0 ? 'uploader' : currentPage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {renderPage()}
      </motion.div>
    </DashboardLayout>
  );
}

export default App;
