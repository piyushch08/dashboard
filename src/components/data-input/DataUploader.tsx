import { useState, useRef, useId } from 'react';
import { UploadCloud, FileSpreadsheet, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { useDataStore } from '../../store/useDataStore';
import { extractDataFromImage, inferDataTypes, sanitizeData } from '../../utils/dataProcessor';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';

export function DataUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const hintId = useId();
  const inputId = useId();

  const { setDataset, apiKey, setSettingsOpen } = useDataStore();

  const handleProcessData = async (data: any[]) => {
    if (data.length === 0) {
      setError("No valid data found.");
      return;
    }
    const cols = inferDataTypes(data);
    const cleanData = sanitizeData(data, cols);
    
    // 1. Show the dashboard immediately for instant feedback!
    setDataset(cleanData, cols);
    
    // 2. Defer the heavy stringify and network upload so it doesn't block the UI render
    setTimeout(() => {
      try {
        const storageRef = ref(storage, 'datasets/global_dataset.json');
        uploadString(storageRef, JSON.stringify(cleanData), 'raw', { contentType: 'application/json' })
          .then(() => getDownloadURL(storageRef))
          .then(downloadURL => {
            setDoc(doc(db, "sessions", "global"), {
              dataUrl: downloadURL,
              columns: cols,
              updatedAt: new Date().toISOString()
            });
          })
          .catch(err => console.error("Firebase sync failed:", err));
      } catch (err: any) {
        console.error("Failed to sync to Firebase: " + err.message);
      }
    }, 100);
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          worker: true,
          complete: async (results) => {
            await handleProcessData(results.data);
            setIsProcessing(false);
          },
          error: (err) => {
            setError(err.message);
            setIsProcessing(false);
          }
        });
        return; // return early because papa parse is callback based
      } else if (file.name.match(/\.(xlsx|xls)$/)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        await handleProcessData(json);
      } else if (file.type.startsWith('image/')) {
        if (!apiKey) {
          setError("Gemini API key is required to analyze images. Please configure it in settings.");
          setSettingsOpen(true);
          setIsProcessing(false);
          return;
        }
        const data = await extractDataFromImage(file, apiKey);
        await handleProcessData(data);
      } else {
        setError("Unsupported file format. Please upload CSV, Excel, or an Image.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
    }
    
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('Text');
    if (text) {
      setIsProcessing(true);
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await handleProcessData(results.data);
          setIsProcessing(false);
        }
      });
    }
  };

  // Keyboard-accessible drop zone activation
  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-4"
      onPaste={handlePaste}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card max-w-3xl w-full p-8 md:p-12 flex flex-col md:flex-row items-center gap-10"
      >
        {/* Header Information */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="w-16 h-16 mx-auto md:mx-0 rounded-2xl bg-[#f3f0ff] flex items-center justify-center shadow-sm">
            <UploadCloud size={32} className="text-[#7B3FE4]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Import Your Data</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Upload a CSV, Excel file, or an image of a data table. We'll automatically process, clean, and visualize your data to help you uncover insights instantly.
            </p>
          </div>
          <div className="pt-2 hidden md:block">
            <ul className="text-xs text-slate-600 space-y-2 text-left">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7B3FE4]"></span> Supports CSV up to 50MB</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7B3FE4]"></span> Supports XLSX / XLS</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7B3FE4]"></span> AI Vision for Data Tables</li>
            </ul>
          </div>
        </div>

        {/* Drop zone */}
        <div className="flex-1 w-full">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file drop zone — click or press Enter to browse, or drag and drop a file"
            aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleDropZoneKeyDown}
            className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
              isDragging
                ? 'border-[#7B3FE4] bg-[#f3f0ff] scale-[1.02] shadow-md'
                : 'border-slate-300 hover:border-[#7B3FE4] hover:bg-[#f3f0ff]/50'
            }`}
          >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 size={36} className="animate-spin" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-600">Analyzing data…</p>
              <span className="sr-only" role="status">Processing your file, please wait.</span>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-5">
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:text-[#7B3FE4] group-hover:bg-white transition-all shadow-sm">
                  <FileSpreadsheet size={24} aria-hidden="true" />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:text-[#7B3FE4] group-hover:bg-white transition-all shadow-sm translate-y-2">
                  <UploadCloud size={24} aria-hidden="true" />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:text-[#7B3FE4] group-hover:bg-white transition-all shadow-sm">
                  <ImageIcon size={24} aria-hidden="true" />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click or drag & drop
              </p>
              <p id={hintId} className="text-xs text-slate-600 mt-2 text-center px-4 leading-relaxed">
                CSV, Excel, or Image <br/>
                <span className="inline-flex items-center gap-1 mt-1">
                  Or use <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono shadow-sm">Ctrl+V</kbd> to paste
                </span>
              </p>
            </>
          )}
        </div>

        {/* Error message */}
        <div aria-live="assertive" aria-atomic="true" className={error ? 'w-full mt-4' : 'sr-only'}>
          {error && (
            <div
              id={errorId}
              role="alert"
              className="w-full p-3 rounded-lg bg-danger-light border border-red-200 text-danger text-sm flex items-start gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <input
          id={inputId}
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".csv, .xlsx, .xls, image/*"
          aria-label="File upload input"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />
        </div>
      </motion.div>
    </div>
  );
}
