import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-400 text-sm py-6 text-center border-t border-gray-200 mt-12 space-y-2">
      <div className="space-x-4">
        <Link to="/system/PrivacyPolicy" className="hover:underline">プライバシーポリシー</Link>
        <Link to="/system/TermsOfService" className="hover:underline">利用規約</Link>
        <Link to="/system/LegalNotice" className="hover:underline">特定商取引法に基づく表記</Link>
      </div>
      <div>
        © {new Date().getFullYear()} Toa Fans Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;