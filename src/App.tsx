import { DashboardLayout } from './components/layout/DashboardLayout';
import { DataUploader } from './components/data-input/DataUploader';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { SettingsModal } from './components/layout/SettingsModal';
import { useDataStore } from './store/useDataStore';
import { AnimatePresence, motion } from 'motion/react';

function App() {
  const { dataset } = useDataStore();

  return (
    <DashboardLayout>
      <SettingsModal />
      <AnimatePresence mode="wait">
        {dataset.length === 0 ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DataUploader />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DynamicDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default App;
