/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { UserRole, UserProfile, Language } from "./types";
import { useTranslation } from "./lib/i18n";

// Layout
import { AppShell } from "./components/layout/AppShell";

// Screens (To be implemented)
import { LandingScreen } from "./components/screens/LandingScreen";
import { AuthScreen } from "./components/screens/AuthScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { Dashboard } from "./components/screens/Dashboard";
import { RecordsScreen } from "./components/screens/RecordsScreen";
import { UploadScreen } from "./components/screens/UploadScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { NotificationsScreen } from "./components/screens/NotificationsScreen";
import { ChatScreen } from "./components/screens/ChatScreen";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<string>("landing");
  const [lang, setLang] = useState<Language>("en");

  const t = useTranslation(lang);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);
          setLang(profileData.preferredLanguage as Language);
          setCurrentScreen("dashboard");
        } else {
          setCurrentScreen("role-selection");
        }
      } else {
        setCurrentScreen("landing");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const fullProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role: profile?.role || UserRole.PATIENT,
      fullName: profileData.fullName || "",
      preferredLanguage: lang,
      createdAt: new Date().toISOString(),
      ...profileData,
    } as UserProfile;

    await setDoc(doc(db, "users", user.uid), fullProfile);
    setProfile(fullProfile);
    setCurrentScreen("dashboard");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auth/Onboarding Screens
  if (currentScreen === "landing") return <LandingScreen onStart={() => setCurrentScreen("auth")} />;
  if (currentScreen === "auth") return <AuthScreen onBack={() => setCurrentScreen("landing")} />;
  if (currentScreen === "role-selection") return (
    <div className="h-screen max-w-md mx-auto p-8 bg-white flex flex-col justify-center">
      <h2 className="text-3xl font-bold mb-8 text-center">{t.welcome}</h2>
      <p className="text-center text-gray-500 mb-8">Choose your role to get started</p>
      <div className="space-y-4">
        <button 
          onClick={() => { setProfile({ role: UserRole.PATIENT } as any); setCurrentScreen("onboarding"); }}
          className="w-full p-6 border-2 border-blue-500 rounded-xl text-left hover:bg-blue-50 transition-colors"
        >
          <h3 className="font-bold text-xl text-blue-700">{t.patient}</h3>
          <p className="text-sm text-gray-600">Store and share your medical history securely.</p>
        </button>
        <button 
          onClick={() => { setProfile({ role: UserRole.DOCTOR } as any); setCurrentScreen("onboarding"); }}
          className="w-full p-6 border-2 border-indigo-500 rounded-xl text-left hover:bg-indigo-50 transition-colors"
        >
          <h3 className="font-bold text-xl text-indigo-700">{t.doctor}</h3>
          <p className="text-sm text-gray-600">Request and view patient records with their permission.</p>
        </button>
      </div>
    </div>
  );
  if (currentScreen === "onboarding") return (
    <OnboardingScreen 
      role={profile?.role || UserRole.PATIENT} 
      onComplete={handleOnboardingComplete} 
    />
  );

  // Main App State
  return (
    <AppShell 
      activeTab={currentScreen} 
      onTabChange={setCurrentScreen}
      userRole={profile?.role}
    >
      {currentScreen === "dashboard" && <Dashboard profile={profile} lang={lang} />}
      {currentScreen === "records" && <RecordsScreen profile={profile} lang={lang} />}
      {currentScreen === "upload" && <UploadScreen profile={profile} lang={lang} />}
      {currentScreen === "chat" && <ChatScreen profile={profile} lang={lang} />}
      {currentScreen === "profile" && <ProfileScreen profile={profile} lang={lang} onUpdate={setProfile} />}
      {currentScreen === "notifications" && <NotificationsScreen profile={profile} lang={lang} />}
    </AppShell>
  );
}


