import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const ThankYouSubscription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const uid = searchParams.get("uid");
    if (!uid) {
      setStatus("error");
      return;
    }

    const updateVipStatus = async () => {
      try {
        const ref = doc(db, "users", uid);
        await setDoc(ref, {
          vip: true,
          vipUpdatedAt: serverTimestamp(),
        }, { merge: true });

        setStatus("success");
        console.log("✅ VIP昇格処理完了");
      } catch (err) {
        console.error("VIP昇格エラー:", err);
        setStatus("error");
      }
    };

    updateVipStatus();
  }, [searchParams]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center bg-white rounded shadow">
      {status === "loading" && <p>確認中です...</p>}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-green-600">🎉 VIP会員へようこそ！</h1>
          <p className="mt-2 text-gray-700">これよりすべての本編動画が視聴可能になりました。</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
          >
            トップページへ戻る
          </button>
        </>
      )}

      {status === "error" && (
        <p className="text-red-600">VIP登録処理に失敗しました。サポートへご連絡ください。</p>
      )}
    </div>
  );
};

export default ThankYouSubscription;
