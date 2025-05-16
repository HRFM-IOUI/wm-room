import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

type VideoData = {
  id: string;
  title?: string;
  category?: string;
  type?: string;
  [key: string]: any;
};

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "videos", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setVideo({ id: snap.id, ...snap.data() } as VideoData);
        } else {
          setError("動画が見つかりませんでした");
        }
      } catch (err) {
        console.error(err);
        setError("データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleStripeCheckout = async () => {
    const user = auth.currentUser;
    if (!user || !video) {
      alert("ログインが必要です");
      return;
    }

    try {
      const res = await fetch("https://<your-worker-subdomain>.workers.dev/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          videoId: video.id,
          returnUrl: `${window.location.origin}/thankyou?videoId=${video.id}&uid=${user.uid}`,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.url) {
        throw new Error(result.error || "決済URL取得に失敗しました");
      }

      window.location.href = result.url;
    } catch (err) {
      console.error("Stripe Checkout エラー:", err);
      alert("決済に失敗しました。もう一度お試しください。");
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!video) return null; // ✅ nullチェックで型安全確保

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow space-y-4">
      <h1 className="text-xl font-bold">単品購入: {video.title}</h1>
      <p className="text-sm text-gray-600">カテゴリ: {video.category}</p>
      <p className="text-sm text-gray-600">タイプ: {video.type}</p>
      <p className="text-sm text-gray-600 mb-4">価格例: 1000円</p>

      <button
        onClick={handleStripeCheckout}
        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
      >
        Stripeで購入する
      </button>
    </div>
  );
};

export default PurchasePage;
