/**
 * Campus Lost & Found Web Portal
 * Frontend for College Full-Stack Project
 * Prepared for Java Spring Boot REST API & MySQL Backend
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/Toast';

import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ReportItemPage } from './pages/ReportItemPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ItemsProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white antialiased">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/report" element={<ReportItemPage />} />
                <Route path="/dashboard" element={<StudentDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* University Footer */}
            <Footer />

            {/* Floating Toast Notifications */}
            <ToastContainer />
          </div>
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
