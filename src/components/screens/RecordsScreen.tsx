import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { UserProfile, UserRole, MedicalRecord, Language } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { FileText, Calendar, Filter, Download, ExternalLink } from "lucide-react";

type Props = {
  profile: UserProfile | null;
  lang: Language;
};

export const RecordsScreen: React.FC<Props> = ({ profile, lang }) => {
  const t = useTranslation(lang);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!profile || profile.role !== UserRole.PATIENT) return;

    const q = query(
      collection(db, "users", profile.uid, "records"),
      orderBy("recordDate", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)));
      setLoading(false);
    });

    return () => unsub();
  }, [profile]);

  if (!profile) return null;

  const filteredRecords = records.filter(r => filter === "all" || r.type === filter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.records}</h2>
        <div className="flex space-x-2">
          <button className="p-2 bg-white rounded-lg border text-gray-500 shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "prescription", "report", "document"].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mb-4 opacity-10" />
          <p>{t.noRecords}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

const RecordItem = ({ record }: { record: MedicalRecord }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm ${
          record.type === 'prescription' ? 'bg-green-50 text-green-600' : 
          record.type === 'report' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
        }`}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{record.title}</h4>
          <div className="flex items-center text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(record.recordDate).toLocaleDateString()}
          </div>
        </div>
        <div className="text-[10px] px-2 py-1 bg-gray-50 text-gray-400 rounded-lg uppercase font-bold">
          {record.type}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-4 animate-in slide-in-from-top-2">
          <p className="text-sm text-gray-600 mb-4">{record.description || "No description provided."}</p>
          
          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {record.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <a 
              href={record.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View File</span>
            </a>
            <button 
              className="p-3 bg-gray-50 text-gray-500 rounded-xl"
              onClick={() => window.open(record.fileUrl)}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
