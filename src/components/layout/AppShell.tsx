import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, FileText, Upload, User, Bell, MessageSquare } from "lucide-react";
import { UserRole } from "../../types";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  userRole?: UserRole;
  notificationCount?: number;
};

export const AppShell: React.FC<Props> = ({ 
  activeTab, 
  onTabChange, 
  children, 
  userRole, 
  notificationCount = 0 
}) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b bg-white flex justify-between items-center z-10">
        <h1 className="font-bold text-xl text-blue-600">MedVault</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onTabChange("notifications")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around items-center p-2 safe-area-bottom z-10 shadow-lg">
        <NavButton 
          active={activeTab === "dashboard"} 
          onClick={() => onTabChange("dashboard")}
          icon={<Home className="w-6 h-6" />}
          label="Home"
        />
        <NavButton 
          active={activeTab === "records"} 
          onClick={() => onTabChange("records")}
          icon={<FileText className="w-6 h-6" />}
          label="Records"
        />
        {userRole === UserRole.PATIENT && (
          <NavButton 
            active={activeTab === "upload"} 
            onClick={() => onTabChange("upload")}
            icon={<Upload className="w-6 h-6" />}
            label="Upload"
          />
        )}
        <NavButton 
          active={activeTab === "chat"} 
          onClick={() => onTabChange("chat")}
          icon={<MessageSquare className="w-6 h-6" />}
          label="Healthu"
        />
        <NavButton 
          active={activeTab === "profile"} 
          onClick={() => onTabChange("profile")}
          icon={<User className="w-6 h-6" />}
          label="Profile"
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
      active ? "text-blue-600 scale-110" : "text-gray-400"
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);
