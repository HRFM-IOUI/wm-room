// src/App.js
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
import Toppage from './pages/user/Toppage'; // ✅ 正しい配置と一致
import UploaderMultipart from './components/video/UploaderMultipart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Toppage />} />
        <Route path="/lounge" element={<Lounge />} />
        <Route path="/subscribe" element={<SubscribeStart />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/system/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/system/TermsOfService" element={<TermsOfService />} />
        <Route path="/system/LegalNotice" element={<LegalNotice />} />
        <Route path="/upload-test" element={<UploaderMultipart />} />
      </Routes>
    </Router>
  );
}

export default App;





