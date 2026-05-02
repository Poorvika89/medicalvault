import React, { useState, useRef } from "react";
import { storage, db } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile, MedicalRecord, Language } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { Upload, X, FileText, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

type Props = {
  profile: UserProfile | null;
  lang: Language;
};

export const UploadScreen: React.FC<Props> = ({ profile, lang }) => {
  const t = useTranslation(lang);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "",
    type: "prescription" as any,
    recordDate: new Date().toISOString().split('T')[0],
    description: "",
    tags: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      handleOCR(e.target.files[0]);
    }
  };

  const handleOCR = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      const prompt = `
        Analyze this medical document. 
        Extract the following information in JSON format:
        {
          "type": "prescription" | "report" | "document",
          "title": "Short title",
          "date": "YYYY-MM-DD",
          "medicines": ["medicine 1", "medicine 2"],
          "summary": "Brief summary of contents",
          "tags": ["tag1", "tag2"]
        }
        Return ONLY the JSON object.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type || "image/jpeg",
                },
              },
            ],
          },
        ],
      });

      const text = response.text || "";
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanedText);

      setMetadata(prev => ({
        ...prev,
        title: data.title || prev.title,
        type: data.type || prev.type,
        recordDate: data.date || prev.recordDate,
        description: data.summary || prev.description,
        tags: data.tags?.join(", ") || prev.tags
      }));
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !profile) return;

    try {
      setUploading(true);
      const fileId = uuidv4();
      const storageRef = ref(storage, `users/${profile.uid}/records/${fileId}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(uploadResult.ref);

      const record: Partial<MedicalRecord> = {
        patientId: profile.uid,
        title: metadata.title || file.name,
        type: metadata.type,
        recordDate: metadata.recordDate,
        description: metadata.description,
        fileUrl,
        fileName: file.name,
        tags: metadata.tags.split(",").map(t => t.trim()).filter(t => t),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "users", profile.uid, "records"), {
        ...record,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setMetadata({
          title: "",
          type: "prescription",
          recordDate: new Date().toISOString().split('T')[0],
          description: "",
          tags: ""
        });
      }, 2000);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in">
        <div className="bg-green-100 text-green-600 p-6 rounded-full">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h3 className="text-2xl font-bold">Upload Successful!</h3>
        <p className="text-gray-500">Your record has been securely stored.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.uploadNew}</h2>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-bold text-gray-700">Tap to Upload</p>
          <p className="text-sm text-gray-400 mt-1">Prescriptions, Lab Reports, etc.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf"
          />
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-4 rounded-2xl border flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-500 mr-3" />
              <div className="truncate max-w-[150px]">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl space-y-4 shadow-sm border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Record Title</label>
              <input 
                type="text" 
                value={metadata.title}
                onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                placeholder="Extracting..."
                className="w-full text-lg font-bold outline-none border-b border-transparent focus:border-blue-200 pb-1"
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Type</label>
                <select 
                  value={metadata.type}
                  onChange={(e) => setMetadata({...metadata, type: e.target.value as any})}
                  className="w-full bg-gray-50 p-2 rounded-lg text-sm"
                  disabled={uploading}
                >
                  <option value="prescription">Prescription</option>
                  <option value="report">Lab Report</option>
                  <option value="document">Other Document</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</label>
                <input 
                  type="date" 
                  value={metadata.recordDate}
                  onChange={(e) => setMetadata({...metadata, recordDate: e.target.value})}
                  className="w-full bg-gray-50 p-2 rounded-lg text-sm"
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Medical Notes / Summary</label>
              <textarea 
                value={metadata.description}
                onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none resize-none min-h-[80px]"
                placeholder="What is this record about?"
                disabled={uploading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tags (Comma separated)</label>
              <input 
                type="text" 
                value={metadata.tags}
                onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                placeholder="e.g. fever, blood test, cardiology"
                className="w-full bg-gray-50 p-2 rounded-lg text-sm"
                disabled={uploading}
              />
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Finalize & Store</span>
            )}
          </button>
        </div>
      )}

      {!file && (
        <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-800">Smart Scan</h4>
            <p className="text-xs text-blue-600/70">Our AI will automatically extract medicine names and dates from your photos.</p>
          </div>
        </div>
      )}
    </div>
  );
};
