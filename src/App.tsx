import { useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { DataUploader } from './components/data-input/DataUploader';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { DataTableView } from './components/dashboard/DataTableView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsModal } from './components/layout/SettingsModal';
import { useDataStore } from './store/useDataStore';

import { motion } from 'motion/react';

function App() {
  const { dataset, currentPage, setDataset } = useDataStore();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'sessions', 'global'), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dataUrl && data.columns) {
          try {
            const res = await fetch(data.dataUrl);
            const jsonData = await res.json();
            // In a real app we might want to prevent setting state if data hasn't changed
            setDataset(jsonData, data.columns);
          } catch (e) {
            console.error("Failed to download dataset from Firebase", e);
          }
        }
      }
    });
    
    return () => unsub();
  }, [setDataset]);

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
