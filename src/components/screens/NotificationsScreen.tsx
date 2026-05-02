import React from "react";
import { UserProfile, Language } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { Bell, Info, AlertCircle, CheckCircle2 } from "lucide-react";

type Props = {
  profile: UserProfile | null;
  lang: Language;
};

export const NotificationsScreen: React.FC<Props> = ({ profile, lang }) => {
  const t = useTranslation(lang);

  // Mock notifications for now as we don't have a listener yet
  const notifications = [
    {
      id: "1",
      title: "Welcome to MedVault",
      message: "Start by uploading your first prescription or medical report.",
      type: "info",
      createdAt: new Date().toISOString(),
      isRead: false
    },
    {
      id: "2",
      title: "Smart Scan Active",
      message: "You can now use AI to automatically extract data from your documents.",
      type: "success",
      createdAt: new Date().toISOString(),
      isRead: true
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.notifications}</h2>

      <div className="space-y-3">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-2xl border flex items-start space-x-4 transition-all ${
              n.isRead ? "bg-white border-gray-100 opacity-70" : "bg-blue-50 border-blue-100 ring-1 ring-blue-200 shadow-sm"
            }`}
          >
            <div className={`p-2 rounded-xl mt-1 ${
              n.type === 'success' ? 'bg-green-100 text-green-600' : 
              n.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
               n.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{n.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
            </div>
            {!n.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
