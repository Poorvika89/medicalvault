import React, { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { UserProfile, Language, LANGUAGES } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { User, LogOut, Globe, Shield, ChevronRight } from "lucide-react";

type Props = {
  profile: UserProfile | null;
  lang: Language;
  onUpdate: (profile: UserProfile) => void;
};

export const ProfileScreen: React.FC<Props> = ({ profile, lang, onUpdate }) => {
  const t = useTranslation(lang);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile ? { ...profile } : null);

  const handleLogout = () => signOut(auth);

  const handleUpdate = async () => {
    if (!profile || !formData) return;
    try {
      const docRef = doc(db, "users", profile.uid);
      await updateDoc(docRef, formData);
      onUpdate(formData as UserProfile);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 shadow-inner">
          {profile.fullName[0]}
        </div>
        <h2 className="text-xl font-bold">{profile.fullName}</h2>
        <p className="text-gray-500 text-sm capitalize">{profile.role}</p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <ProfileItem 
          icon={<User className="text-blue-500" />} 
          label={t.profile} 
          value="Manage personal details"
          onClick={() => setEditing(true)}
        />
        <ProfileItem 
          icon={<Globe className="text-purple-500" />} 
          label={t.language} 
          value={LANGUAGES[lang]}
          onClick={() => setEditing(true)}
        />
        <ProfileItem 
          icon={<Shield className="text-green-500" />} 
          label="Privacy" 
          value="Manage data sharing"
        />
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 font-bold bg-white rounded-3xl border border-red-50 hover:bg-red-50 transition-colors mt-8"
      >
        <LogOut className="w-5 h-5" />
        <span>{isEnglish(lang) ? "Logout" : "लॉगआउट"}</span>
      </button>

      {editing && formData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 animate-in slide-in-from-bottom">
            <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                <input 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Language</label>
                <select 
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value as Language})}
                  className="w-full p-3 bg-gray-50 rounded-xl outline-none"
                >
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setEditing(false)}
                className="flex-1 py-3 text-gray-500 font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileItem = ({ icon, label, value, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left"
  >
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4">
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold">{label}</h4>
      <p className="text-xs text-gray-400">{value}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300" />
  </button>
);

const isEnglish = (lang: string) => lang === 'en';
