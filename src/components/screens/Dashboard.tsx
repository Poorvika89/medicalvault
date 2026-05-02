import React, { useState, useEffect } from "react";
import { collection, query, limit, orderBy, onSnapshot, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { UserProfile, UserRole, MedicalRecord, AccessRequest, Language } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { FileText, Users, Clock, QrCode, Scan, Bell, Heart, Activity, Thermometer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";

type Props = {
  profile: UserProfile | null;
  lang: Language;
};

export const Dashboard: React.FC<Props> = ({ profile, lang }) => {
  const t = useTranslation(lang);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [sharedDoctors, setSharedDoctors] = useState<AccessRequest[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!profile) return;

    let unsubRecords: () => void;
    let unsubAccess: () => void;

    if (profile.role === UserRole.PATIENT) {
      const recordsQuery = query(
        collection(db, "users", profile.uid, "records"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      unsubRecords = onSnapshot(recordsQuery, (snap) => {
        setRecentRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)));
      });

      const accessQuery = query(
        collection(db, "accessRequests"),
        where("patientId", "==", profile.uid),
        where("status", "in", ["pending", "granted"])
      );
      unsubAccess = onSnapshot(accessQuery, (snap) => {
        setSharedDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() } as AccessRequest)));
      });
    } else {
      // Doctor dashboard
      const requestsQuery = query(
        collection(db, "accessRequests"),
        where("doctorId", "==", profile.uid),
        where("status", "==", "pending")
      );
      unsubAccess = onSnapshot(requestsQuery, (snap) => {
        setAccessRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as AccessRequest)));
      });

      const patientsQuery = query(
        collection(db, "accessRequests"),
        where("doctorId", "==", profile.uid),
        where("status", "==", "granted")
      );
      unsubRecords = onSnapshot(patientsQuery, (snap) => {
        setSharedDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() } as AccessRequest)));
      });
    }

    return () => {
      unsubRecords?.();
      unsubAccess?.();
    };
  }, [profile]);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(async (decodedText) => {
        try {
          const patientId = decodedText;
          const requestId = `${patientId}_${profile?.uid}`;
          await setDoc(doc(db, "accessRequests", requestId), {
            id: requestId,
            patientId,
            doctorId: profile?.uid,
            doctorName: profile?.fullName,
            status: "pending",
            requestedAt: new Date().toISOString(),
            createdAt: serverTimestamp()
          });
          alert("Access request sent via QR!");
          scanner.clear();
          setShowScanner(false);
        } catch (err) {
          console.error(err);
          alert("Failed to request access.");
        }
      }, (error) => {});
      return () => {
        scanner.clear().catch(err => console.error("Scanner clear error", err));
      };
    }
  }, [showScanner]);

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
            {profile.fullName[0]}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Good Morning,</p>
            <h2 className="text-lg font-bold">{profile.fullName.split(" ")[0]}</h2>
          </div>
        </div>
        <button 
          onClick={() => setShowQR(profile.role === UserRole.PATIENT)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {profile.role === UserRole.PATIENT ? <QrCode className="w-5 h-5" /> : <Scan className="w-5 h-5" onClick={() => setShowScanner(true)} />}
        </button>
      </header>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Health Pulse</p>
            <h3 className="text-2xl font-bold mb-4">Stable & Active</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Heart className="w-4 h-4 text-red-300" />
                <span className="text-xs font-bold">72 BPM</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4 text-green-300" />
                <span className="text-xs font-bold">98% SpO2</span>
              </div>
            </div>
          </div>
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{recentRecords.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Storage Used</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{sharedDoctors.filter(d => d.status === 'granted').length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trusted Doctors</p>
          </div>
        </div>
      </div>

      {/* Reminders / Daily Tips */}
      <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center">
            <Bell className="w-4 h-4 mr-2 text-yellow-500" />
            {t.reminders}
          </h3>
          <span className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg font-bold">2 Active</span>
        </div>
        <div className="space-y-3">
          <ReminderItem 
            title="Update Medical History" 
            time="Every Monday" 
            bgColor="bg-blue-50" 
            icon={<FileText className="w-4 h-4 text-blue-600" />}
          />
          <ReminderItem 
            title="Health Checkup Due" 
            time="In 12 Days" 
            bgColor="bg-purple-50" 
            icon={<Activity className="w-4 h-4 text-purple-600" />}
          />
        </div>
      </section>

      {/* Access Requests for Doctors */}
      {profile.role === UserRole.DOCTOR && accessRequests.length > 0 && (
         <section>
          <h3 className="font-bold text-gray-800 mb-4">{t.pendingRequests}</h3>
          <div className="space-y-3">
            {accessRequests.map(req => (
              <div key={req.id} className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex justify-between items-center animate-pulse">
                <div>
                  <p className="font-bold text-sm">New Request Sent</p>
                  <p className="text-xs text-yellow-700">Waiting for patient approval...</p>
                </div>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm flex flex-col items-center text-center space-y-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">My Personal QR</h3>
                <p className="text-sm text-gray-500 mt-1">Let doctors scan this to request access to your vault.</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-inner">
                <QRCodeSVG value={profile.uid} size={200} level="H" includeMargin />
              </div>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-4 text-gray-400 font-bold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-bold">Scan Patient QR</h3>
              <button onClick={() => setShowScanner(false)} className="p-2 bg-white/10 rounded-full">
                <Bell className="w-5 h-5 rotate-45" /> 
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div id="reader" className="w-full max-w-sm overflow-hidden rounded-[2rem] border-4 border-blue-500"></div>
            </div>
            <div className="p-8 text-center text-white/50 text-sm">
              Aim the camera at the patient's MedVault QR code.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReminderItem = ({ title, time, bgColor, icon }: any) => (
  <div className={`p-4 ${bgColor} rounded-2xl flex items-center space-x-4`}>
    <div className="p-2 bg-white rounded-xl shadow-sm">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-800">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{time}</p>
    </div>
  </div>
);


const RecordCard = ({ record }: { record: MedicalRecord }) => (
  <div className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
      record.type === 'prescription' ? 'bg-green-50 text-green-600' : 
      record.type === 'report' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
    }`}>
      <FileText className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm truncate">{record.title}</h4>
      <p className="text-xs text-gray-400">{new Date(record.recordDate || record.createdAt).toLocaleDateString()}</p>
    </div>
    <div className="text-[10px] px-2 py-1 bg-gray-50 text-gray-400 rounded uppercase font-bold">
      {record.type}
    </div>
  </div>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode, message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 mb-2 opacity-20" }) : null}
    <p className="text-sm">{message}</p>
  </div>
);
