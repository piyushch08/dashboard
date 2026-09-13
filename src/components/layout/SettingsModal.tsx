import { X } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useState } from 'react';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, apiKey, setApiKey } = useDataStore();
  const [localKey, setLocalKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(localKey);
    setSettingsOpen(false);
  };

  if (!isSettingsOpen) return null;

  return (
    <>
      <div 
        onClick={() => setSettingsOpen(false)}
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 p-6 rounded-xl z-50 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Gemini API Key</label>
          <input 
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Required for image analysis. Stored locally in your browser only.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button 
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
