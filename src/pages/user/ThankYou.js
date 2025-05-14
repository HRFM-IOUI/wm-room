import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const ThankYouPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updatePurchaseStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get("videoId");
      const uid = urlParams.get("uid");

      if (!videoId || !uid) {
        console.error("パラメータ不足: videoIdまたはuidが不明です");
        return;
      }

      const ref = doc(db, "purchases", `${uid}_${videoId}`);

      try {
        const snap = await getDoc(ref);

        if (snap.exists()) {
          // 既存レコード → ステータス更新のみ
          await updateDoc(ref, {
            status: "paid",
            updatedAt: serverTimestamp(),
          });
          console.log("✅ 購入ステータスを更新しました");
        } else {
          // 新規レコード作成
          await setDoc(ref, {
            userId: uid,
            videoId,
            status: "paid",
            purchasedAt: serverTimestamp(),
          });
          console.log("✅ 購入情報を新規登録しました");
        }
      } catch (err) {
        console.error("Firestore 書き込みエラー:", err);
      }
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


