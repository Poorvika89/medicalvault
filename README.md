# MedVault Development Guide

MedVault is a secure, mobile-first healthcare repository. This guide helps you set up the project locally and prepare it for deployment or GitHub.

## Local Setup

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Firebase Configuration:**
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Google Login and Email/Password).
   - Create a **Firestore** database in `asia-southeast1`.
   - Create a **Storage** bucket.
   - Project Settings > Add App > Web App.
   - Copy the configuration and create `firebase-applet-config.json` in the root:
     ```json
     {
       "apiKey": "...",
       "authDomain": "...",
       "projectId": "...",
       "storageBucket": "...",
       "messagingSenderId": "...",
       "appId": "...",
       "firestoreDatabaseId": "(default)"
     }
     ```
4. **Environment Variables:**
   - Create a `.env` file based on `.env.example`.
   - Add your `GEMINI_API_KEY`.
5. **Run Development Server:**
   ```bash
   npm run dev
   ```

## GitHub Pushing Instructions

1. **Do NOT push `firebase-applet-config.json`** if it contains sensitive keys (though client side keys are usually fine, it's good practice to use environment variables).
2. **Ensure `.gitignore` includes:**
   - `node_modules`
   - `dist`
   - `.env`
3. **Push to repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MedVault"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## Features for GitHub Showcase
- **Full Stack:** Node.js Express backend + React frontend.
- **AI Powered:** Smart OCR for medical records and AI Health Chatbot (Healthu) using Gemini 2.0 Flash.
- **Secure:** Firebase Auth + Firestore Rules for patient record privacy.
- **Mobile First:** Responsive design optimized for mobile viewports using Tailwind CSS and Framer Motion.
- **QR Support:** QR generation for patients and scanning for doctors.
- **Multilingual:** Support for English, Hindi, Tamil, Telugu, and Bengali.
