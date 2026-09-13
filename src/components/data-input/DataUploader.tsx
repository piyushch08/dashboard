import { useState, useRef } from 'react';
import { UploadCloud, FileType, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useDataStore } from '../../store/useDataStore';
import { extractDataFromImage, inferDataTypes, sanitizeData } from '../../utils/dataProcessor';

export function DataUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setDataset, apiKey, setSettingsOpen } = useDataStore();

  const handleProcessData = (data: any[]) => {
    if (data.length === 0) {
      setError("No valid data found.");
      return;
    }
    const cols = inferDataTypes(data);
    const cleanData = sanitizeData(data, cols);
    setDataset(cleanData, cols);
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => handleProcessData(results.data),
          error: (err) => setError(err.message)
        });
      } else if (file.name.match(/\.(xlsx|xls)$/)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        handleProcessData(json);
      } else if (file.type.startsWith('image/')) {
        if (!apiKey) {
          setError("Gemini API key is required to analyze images. Please configure it in settings.");
          setSettingsOpen(true);
          setIsProcessing(false);
          return;
        }
        const data = await extractDataFromImage(file, apiKey);
        handleProcessData(data);
      } else {
        setError("Unsupported file format. Please upload CSV, Excel, or an Image.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
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
        complete: (results) => {
          handleProcessData(results.data);
          setIsProcessing(false);
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]" onPaste={handlePaste}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-2xl w-full p-8 rounded-3xl flex flex-col items-center gap-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Import Your Data</h2>
          <p className="text-slate-400">Upload an Excel sheet, CSV file, or an Image of a table.</p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-neon-cyan bg-neon-cyan/5' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4 text-neon-cyan">
              <Loader2 size={48} className="animate-spin" />
              <p className="font-semibold animate-pulse">Analyzing Data...</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4 text-slate-400">
                <FileType size={40} />
                <ImageIcon size={40} />
                <UploadCloud size={40} />
              </div>
              <p className="text-lg font-semibold text-white">Click or drag and drop to upload</p>
              <p className="text-sm text-slate-400 mt-1">or Ctrl+V to paste CSV text</p>
            </>
          )}
        </div>

        {error && (
          <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept=".csv, .xlsx, .xls, image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />
      </motion.div>
    </div>
  );
}
