// src/pages/ThankYou.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from '../../firebase';
import { doc, updateDoc } from "firebase/firestore";

const ThankYouPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updatePurchaseStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get("videoId");
      const uid = urlParams.get("uid");

      if (videoId && uid) {
        const ref = doc(db, "purchases", `${uid}_${videoId}`);
        try {
          await updateDoc(ref, { status: "paid" });
          console.log("購入ステータス更新完了");
        } catch (err) {
          console.error("Firestore更新エラー:", err);
        }
      }

      // 数秒後にマイページなどに遷移させてもよい
      // setTimeout(() => navigate("/mypage"), 4000);
    };

    updatePurchaseStatus();
  }, [navigate]);

  return (
    <div className="p-8 max-w-xl mx-auto text-center bg-white shadow rounded">
      <h1 className="text-2xl font-bold text-green-600">🎉 ご購入ありがとうございます！</h1>
      <p className="mt-4 text-gray-700">決済が正常に完了しました。</p>
      <button
        onClick={() => navigate("/mypage")}
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        マイページに戻る
      </button>
    </div>
  );
};

export default ThankYouPage;

