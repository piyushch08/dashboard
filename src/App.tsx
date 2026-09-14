import { DashboardLayout } from './components/layout/DashboardLayout';
import { DataUploader } from './components/data-input/DataUploader';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { DataTableView } from './components/dashboard/DataTableView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsModal } from './components/layout/SettingsModal';
import { InvoicesDashboard } from './components/invoices/InvoicesDashboard';
import { useDataStore } from './store/useDataStore';

function App() {
  const { dataset, currentPage } = useDataStore();

  const renderPage = () => {
    // We can allow invoices to render even without a dataset for testing
    if (dataset.length === 0 && currentPage !== 'invoices') return <DataUploader />;

    switch (currentPage) {
      case 'overview': return <DynamicDashboard />;
      case 'analytics': return <AnalyticsView />;
      case 'data-table': return <DataTableView />;
      case 'reports': return <ReportsView />;
      default: return <DynamicDashboard />;
    }
  };

  // Render the full-screen invoices dashboard without the standard sidebar layout
  if (currentPage === 'invoices') {
    return <InvoicesDashboard />;
  }

  return (
    <DashboardLayout>
      <SettingsModal />
      {renderPage()}
    </DashboardLayout>
  );
}

export default App;
