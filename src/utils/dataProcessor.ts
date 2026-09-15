import type { ColumnMeta, DataType } from '../store/useDataStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Infer column types based on the first few rows
export function inferDataTypes(data: any[]): ColumnMeta[] {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0]);
  const columns: ColumnMeta[] = [];

  keys.forEach((key) => {
    let type: DataType = 'string';
    
    // Sample up to 5 rows to guess type
    for (let i = 0; i < Math.min(data.length, 5); i++) {
      const val = data[i][key];
      if (val === null || val === undefined || val === '') continue;

      if (!isNaN(Number(val))) {
        type = 'number';
        break; // Confirmed number
      }
      
      const dateParsed = Date.parse(val);
      if (!isNaN(dateParsed) && val.length > 8) {
        type = 'date';
        break;
      }
    }

    columns.push({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      type
    });
  });

  return columns;
}

export function sanitizeData(data: any[], columns: ColumnMeta[]): any[] {
  const numericKeys = columns.filter(c => c.type === 'number').map(c => c.key);
  
  if (numericKeys.length === 0) return data;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < numericKeys.length; j++) {
      const k = numericKeys[j];
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
        row[k] = Number(row[k]);
      }
    }
  }
  
  return data;
}

// Convert File to base64 for Gemini
function fileToGenerativePart(file: File): Promise<{inlineData: {data: string, mimeType: string}}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: { data: base64data, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract JSON from Image via Gemini
export async function extractDataFromImage(file: File, apiKey: string): Promise<any[]> {
  if (!apiKey) throw new Error("Gemini API key is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this image containing a table or chart. Extract the data into a clean, flat JSON array of objects.
Do not wrap it in markdown block quotes (no \`\`\`json). Return ONLY the raw valid JSON array.
Use sensible, short camelCase keys based on the column headers. Guess the headers if none are present.`;

  const imagePart = await fileToGenerativePart(file);
  
  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  
  try {
    // Sometimes it still wraps it in markdown despite instructions, so strip it just in case
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI output:", text);
    throw new Error("AI returned invalid data format. Please try another image.");
  }
}
