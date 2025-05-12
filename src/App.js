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
import UploaderMultipart from './components/video/UploaderMultipart';

import ProtectedRoute from './components/ProtectedRoute'; // 🔐 追加

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
        <Route path="/mypage" element={<ProtectedRoute element={<Mypage />} />} />
        <Route path="/upload-test" element={<ProtectedRoute element={<UploaderMultipart />} />} />
      </Routes>
    </Router>
  );
}

export default App;







