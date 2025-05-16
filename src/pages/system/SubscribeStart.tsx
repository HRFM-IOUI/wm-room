// ✅ src/pages/system/SubscribeStart.js
import React from 'react';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { createFreeSubscription } from '../../utils/stripeUtils';

const SubscribeStart = () => {
  const navigate = useNavigate();

  const handleJoin = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      alert('ログインが必要です');
      return;
    }

    try {
      await createFreeSubscription(user.uid, user.email);
    } catch (err) {
      console.error('サブスク加入失敗:', err);
      alert('加入処理に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-gray-50 p-6 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-center">無料お試しで今すぐ参加！</h2>
        <p className="text-sm text-gray-600 text-center">
          初回1ヶ月無料！その後は月額2,980円で自動継続されます。
        </p>
        <button
          onClick={handleJoin}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          サブスクを開始する
        </button>
        <p className="text-xs text-gray-500 text-center">
          解約はいつでも可能です。<br />
          マイページから手続きできます。
        </p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/lounge')}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Loungeに戻る
        </button>
      </div>
    </div>
  );
};

export default SubscribeStart;
