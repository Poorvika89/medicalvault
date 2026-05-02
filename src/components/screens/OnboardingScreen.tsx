import React, { useState } from "react";
import { UserRole, UserProfile } from "../../types";

type Props = {
  role: UserRole;
  onComplete: (data: Partial<UserProfile>) => void;
};

export const OnboardingScreen: React.FC<Props> = ({ role, onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "male",
    bloodGroup: "A+",
    address: "",
    medicalDegree: "",
    qualification: "",
    preferredLanguage: "en"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    } as any);
  };

  return (
    <div className="h-screen max-w-md mx-auto bg-white p-6 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-2">Complete Profile</h2>
      <p className="text-gray-500 mb-8">We need a few more details to set up your {role} account.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <InputGroup 
            label="Full Name" 
            value={formData.fullName} 
            onChange={(v) => setFormData({ ...formData, fullName: v })}
            required
          />

          {role === UserRole.PATIENT ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup 
                  label="Age" 
                  type="number"
                  value={formData.age} 
                  onChange={(v) => setFormData({ ...formData, age: v })}
                />
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-400">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-400">Blood Group</label>
                <select 
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <InputGroup 
                label="Medical Degree" 
                value={formData.medicalDegree} 
                onChange={(v) => setFormData({ ...formData, medicalDegree: v })}
                placeholder="e.g. MBBS, MD"
                required
              />
              <InputGroup 
                label="Specialization / Qualification" 
                value={formData.qualification} 
                onChange={(v) => setFormData({ ...formData, qualification: v })}
                placeholder="e.g. Cardiology"
              />
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-400">Address</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none min-h-[100px]"
              placeholder="City, State, Country"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-400">Preferred Language</label>
            <select 
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-8"
        >
          Complete Setup
        </button>
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", placeholder, required }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold uppercase text-gray-400">{label}</label>
    <input 
      type={type} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);
