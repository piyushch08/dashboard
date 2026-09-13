import { DashboardLayout } from './components/layout/DashboardLayout';
import { DataUploader } from './components/data-input/DataUploader';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { SettingsModal } from './components/layout/SettingsModal';
import { useDataStore } from './store/useDataStore';

function App() {
  const { dataset } = useDataStore();

  return (
    <DashboardLayout>
      <SettingsModal />
      {dataset.length === 0 ? <DataUploader /> : <DynamicDashboard />}
    </DashboardLayout>
  );
}

export default App;
