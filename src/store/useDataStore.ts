import { create } from 'zustand';

export type DataType = 'number' | 'string' | 'date';
export type PageView = 'overview' | 'analytics' | 'data-table' | 'reports';

export interface ColumnMeta {
  key: string;
  type: DataType;
  label: string;
}

interface DataState {
  dataset: any[];
  columns: ColumnMeta[];
  apiKey: string;
  isSettingsOpen: boolean;
  currentPage: PageView;
  searchQuery: string;
  setDataset: (data: any[], cols: ColumnMeta[]) => void;
  setApiKey: (key: string) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setCurrentPage: (page: PageView) => void;
  setSearchQuery: (query: string) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  dataset: [],
  columns: [],
  apiKey: localStorage.getItem('gemini_api_key') || '',
  isSettingsOpen: false,
  currentPage: 'overview',
  searchQuery: '',
  
  setDataset: (dataset, columns) => set({ dataset, columns, currentPage: 'overview' }),
  
  setApiKey: (key) => {
    localStorage.setItem('gemini_api_key', key);
    set({ apiKey: key });
  },
  
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  clearData: () => set({ dataset: [], columns: [], currentPage: 'overview', searchQuery: '' }),
}));
