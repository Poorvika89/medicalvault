import React from "react";
import { motion } from "motion/react";
import { Shield, FileText, Share2 } from "lucide-react";

export const LandingScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="h-screen max-w-md mx-auto bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col p-8 overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center space-y-12">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30"
        >
          <Shield className="w-12 h-12 text-white" />
        </motion.div>

        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight"
          >
            MedVault
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-100 text-lg max-w-xs mx-auto"
          >
            Your secure digital repository for prescriptions and medical reports.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <FileText className="w-6 h-6 mb-2 text-blue-200" />
            <span className="text-xs font-medium">Digital Logs</span>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <Share2 className="w-6 h-6 mb-2 text-blue-200" />
            <span className="text-xs font-medium">Easy Sharing</span>
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: "spring" }}
        onClick={onStart}
        className="bg-white text-blue-700 w-full py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-50 active:scale-95 transition-all"
      >
        Get Started
      </motion.button>
    </div>
  );
};
