import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Lounge from './pages/system/Lounge';
import SubscribeStart from './pages/system/SubscribeStart';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import PrivacyPolicy from './pages/system/PrivacyPolicy';
import TermsOfService from './pages/system/TermsOfService';
import LegalNotice from './pages/system/LegalNotice';

import Toppage from './pages/user/Toppage';
import Mypage from './pages/user/Mypage';
import Dashboard from './pages/user/Dashboard';
import Uploader from './components/video/Uploader';
import VideoDetail from './pages/user/VideoDetail'; // ✅ 追加

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* 公開ページ */}
        <Route path="/lounge" element={<Lounge />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subscribe" element={<SubscribeStart />} />
        <Route path="/system/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/system/TermsOfService" element={<TermsOfService />} />
        <Route path="/system/LegalNotice" element={<LegalNotice />} />

        {/* 認証保護ページ */}
        <Route path="/" element={<ProtectedRoute element={<Toppage />} />} />
        <Route path="/toppage" element={<ProtectedRoute element={<Toppage />} />} />
        <Route path="/mypage" element={<ProtectedRoute element={<Mypage />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/upload-test" element={<ProtectedRoute element={<Uploader />} />} />
        <Route path="/video/:id" element={<ProtectedRoute element={<VideoDetail />} />} /> {/* ✅ 追加 */}
      </Routes>
    </Router>
  );
}

export default App;









