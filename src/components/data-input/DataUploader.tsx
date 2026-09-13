import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Image as ImageIcon, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)]" onPaste={handlePaste}>
      <div className="card max-w-xl w-full p-8 flex flex-col items-center gap-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Import Your Data</h2>
          <p className="text-sm text-gray-500">Upload a CSV, Excel file, or an image of a data table.</p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-52 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary-light/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 size={36} className="animate-spin" />
              <p className="text-sm font-medium text-gray-600">Analyzing data…</p>
            </div>
          ) : (
            <>
              <div className="flex gap-6 mb-4 text-gray-400">
                <FileSpreadsheet size={28} />
                <ImageIcon size={28} />
                <UploadCloud size={28} />
              </div>
              <p className="text-sm font-medium text-gray-700">Click or drag and drop to upload</p>
              <p className="text-xs text-gray-400 mt-1">Ctrl+V to paste CSV text</p>
            </>
          )}
        </div>

        {error && (
          <div className="w-full p-3 rounded-lg bg-danger-light border border-red-200 text-danger text-sm">
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
      </div>
    </div>
  );
}
