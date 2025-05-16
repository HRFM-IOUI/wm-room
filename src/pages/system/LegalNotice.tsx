// src/pages/system/LegalNotice.js
import React from 'react';
import BackButton from '../../components/common/BackButton';

const LegalNotice = () => {
  return (
    <div className="bg-white min-h-screen py-12 px-6 text-gray-800 flex flex-col items-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-center">特定商取引法に基づく表記</h1>

        <ul className="space-y-2 text-sm bg-gray-50 p-4 rounded shadow">
          <li><strong>販売業者名：</strong>ワンダーメタニズム株式会社</li>
          <li><strong>運営責任者：</strong>HIRAYAMA　SHOU</li>
          <li><strong>所在地：</strong>東京都杉並区高井戸東3-19-8　TMレジデンス202</li>
          <li><strong>お問い合わせ：</strong>support@toafans.shop</li>
          <li><strong>販売価格：</strong>各商品・サービスごとに表示された価格に基づきます</li>
          <li><strong>商品代金以外の必要料金：</strong>振込手数料・通信費等（ユーザー負担）</li>
          <li><strong>お支払い方法：</strong>各種リンク決済・銀行振込・クレジットカード等</li>
          <li><strong>提供時期：</strong>決済確認後、即時または個別指定に応じて提供</li>
          <li><strong>返品・キャンセル：</strong>商品の性質上、提供後のキャンセル・返金は不可とさせていただきます</li>
        </ul>

        <p className="text-xs text-gray-500">
          本表記は法令の改正や事業方針の変更に伴い、必要に応じて随時更新されます。
        </p>

        <BackButton label="Loungeに戻る" to="/lounge" />
      </div>
    </div>
  );
};

export default LegalNotice;