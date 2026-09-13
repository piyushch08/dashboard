import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDataStore } from '../../store/useDataStore';
import { useState } from 'react';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, apiKey, setApiKey } = useDataStore();
  const [localKey, setLocalKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(localKey);
    setSettingsOpen(false);
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-panel p-6 rounded-2xl z-50 shadow-2xl border-slate-600/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Google Gemini API Key</label>
                <input 
                  type="password"
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Required to extract data from uploaded images. Your key is securely stored in your browser's local storage and never sent anywhere else.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-neon-cyan text-slate-900 hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
