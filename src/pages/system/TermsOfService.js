// src/pages/system/TermsOfService.js
import React from 'react';
import BackButton from '../../components/common/BackButton';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center py-12 px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-center">利用規約</h1>
        <section className="bg-gray-50 p-4 rounded shadow text-sm text-gray-700 space-y-4">
          <p>
            本利用規約（以下「本規約」）は、Toa Fans Shop（以下「当サービス」）が提供するサービス・コンテンツの利用条件を定めるものです。ユーザーは、本規約に同意した上で、当サービスをご利用ください。
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>当サービスにおける全コンテンツは、無断転載・複製・二次配布を固く禁止します。</li>
            <li>当サービスへの迷惑行為、または法令・公序良俗に反する行為は禁止します。</li>
            <li>サービス内容は、予告なく変更または中止される場合があります。</li>
            <li>ユーザー間のトラブルや損害に関して、当サービスは一切責任を負いません。</li>
          </ul>
          <p className="text-xs text-gray-500">
            本規約は必要に応じて改訂され、最新の内容は本ページにて随時掲載します。
          </p>
        </section>
        <BackButton label="Loungeに戻る" to="/lounge" />
      </div>
    </div>
  );
};

export default TermsOfService;