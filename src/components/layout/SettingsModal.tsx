import { X } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useState, useEffect, useRef, useId } from 'react';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, apiKey, setApiKey } = useDataStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();

  // Sync local key when store changes
  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  // Focus input when modal opens; focus close button when Escape is pressed
  useEffect(() => {
    if (isSettingsOpen) {
      // Small delay so the element is mounted & visible before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSettingsOpen]);

  // Escape key closes the modal
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSettingsOpen, setSettingsOpen]);

  // Focus trap inside the modal
  useEffect(() => {
    if (!isSettingsOpen) return;
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isSettingsOpen]);

  const handleSave = () => {
    setApiKey(localKey);
    setSettingsOpen(false);
  };

  if (!isSettingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setSettingsOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-50"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        id="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 p-6 rounded-2xl z-50 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            ref={closeRef}
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div>
          <label
            htmlFor="gemini-api-key"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Google Gemini API Key
          </label>
          <input
            ref={inputRef}
            id="gemini-api-key"
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="AIzaSy..."
            autoComplete="off"
            aria-describedby={descId}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <p id={descId} className="text-xs text-gray-400 mt-1.5">
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
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
