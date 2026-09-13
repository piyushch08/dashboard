import { create } from 'zustand';

export type DataType = 'number' | 'string' | 'date';

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
  setDataset: (data: any[], cols: ColumnMeta[]) => void;
  setApiKey: (key: string) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  dataset: [],
  columns: [],
  apiKey: localStorage.getItem('gemini_api_key') || '',
  isSettingsOpen: false,
  
  setDataset: (dataset, columns) => set({ dataset, columns }),
  
  setApiKey: (key) => {
    localStorage.setItem('gemini_api_key', key);
    set({ apiKey: key });
  },
  
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  
  clearData: () => set({ dataset: [], columns: [] }),
}));
