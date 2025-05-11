// src/pages/system/PrivacyPolicy.js
import React from 'react';
import BackButton from '../../components/common/BackButton';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white min-h-screen py-12 px-6 text-gray-800 flex flex-col items-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-center">プライバシーポリシー</h1>

        <div className="bg-gray-50 p-4 rounded shadow text-sm text-gray-700 space-y-4">
          <p>
            Toa Fans Shop （以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
          </p>
          <p>
            ご提供いただいた個人情報は、本人確認・サービスの提供・改善・不正行為の防止に活用されます。
          </p>
          <p>
            当サービスは、ユーザーの同意がない限り、法令に基づく場合を除き、第三者に情報を提供いたしません。
          </p>
          <p>
            個人情報の開示・訂正・削除をご希望される場合は、当サービスのお問い合わせフォームよりご連絡ください。
          </p>
          <p className="text-xs text-gray-500">
            本ポリシーは法改正や運営方針に応じて変更される場合があり、変更後は本ページにて通知されます。
          </p>
        </div>

        <BackButton label="Loungeに戻る" to="/lounge" />
      </div>
    </div>
  );
};

export default PrivacyPolicy;