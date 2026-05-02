export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor"
}

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  medicalDegree?: string;
  qualification?: string;
  isVerified?: boolean;
  preferredLanguage: string;
  createdAt: string;
};

export type MedicalRecord = {
  id: string;
  patientId: string;
  type: "prescription" | "report" | "document";
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  tags: string[];
  createdAt: string;
  recordDate: string;
  ocrData?: any;
};

export type AccessRequest = {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  status: "pending" | "granted" | "revoked" | "expired";
  requestedAt: string;
  expiresAt?: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export const LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali"
};

export type Language = keyof typeof LANGUAGES;
