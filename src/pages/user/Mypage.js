import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getUserVipStatus } from '../../utils/vipUtils';
import { useNavigate } from 'react-router-dom';
import VideoCard from '../../components/video/VideoCard';

const Mypage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [vipStatus, setVipStatus] = useState({
    rank: 'Bronze',
    points: 0,
    gachaCount: 0,
    totalSpent: 0,
  });

  const [purchasedVideos, setPurchasedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().isOwner) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const detailedOrders = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const items = data.items || [];
          return {
            id: docSnap.id,
            ...data,
            items,
          };
        })
      );
      setOrders(detailedOrders);
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchVip = async () => {
      if (!user) return;
      const vs = await getUserVipStatus(user.uid);
      setVipStatus(vs);
    };
    fetchVip();
  }, [user]);

  useEffect(() => {
    const fetchPurchasedVideos = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'purchases'),
          where('userId', '==', user.uid),
          where('status', '==', 'paid')
        );
        const snap = await getDocs(q);
        const results = [];

        for (const purchase of snap.docs) {
          const { videoId } = purchase.data();
          const videoRef = doc(db, 'videos', videoId);
          const videoSnap = await getDoc(videoRef);
          if (videoSnap.exists()) {
            results.push({ id: videoSnap.id, ...videoSnap.data() });
          }
        }

        setPurchasedVideos(results);
      } catch (err) {
        console.error('購入済み動画の取得エラー:', err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchPurchasedVideos();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
        <p>ログインしていません。マイページを表示できません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        <h1 className="text-2xl font-bold">マイページ</h1>

        {/* プロフィール */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold mb-2">プロフィール</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>表示名:</strong> {user.displayName || '名無しユーザー'}</p>
            <p><strong>メール:</strong> {user.email}</p>
            {isOwner && (
              <p className="text-pink-600 font-semibold">
                管理者アカウント（isOwner = true）
              </p>
            )}
          </div>

          {isOwner && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              管理画面へ
            </button>
          )}
        </div>

        {/* VIPステータス */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-2">
          <h2 className="text-lg font-semibold mb-2">VIPステータス</h2>
          <p className="text-sm">
            ランク: <span className="font-bold text-pink-600">{vipStatus.rank}</span>
          </p>
          <p className="text-sm">
            所持ポイント: <span className="font-bold">{vipStatus.points}pt</span>
          </p>
          <p className="text-sm">
            累計ガチャ回数: <span className="font-bold">{vipStatus.gachaCount}</span>
          </p>
          <p className="text-sm">
            累計課金額: <span className="font-bold">¥{vipStatus.totalSpent}</span>
          </p>
        </div>

        {/* 購入履歴 */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold mb-2">購入履歴</h2>
          {loadingOrders ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">購入履歴がありません。</p>
          ) : (
            <ul className="space-y-4 text-sm text-gray-700">
              {orders.map(order => (
                <li key={order.id} className="border p-3 rounded bg-white">
                  <p className="font-semibold mb-1">
                    注文日時: {order.createdAt?.toDate().toLocaleString() || '不明'}
                  </p>
                  <p className="text-gray-600 mb-1">ステータス: {order.status}</p>
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.title || '商品名不明'} × {item.quantity || 1}</span>
                        <span>¥{item.price}</span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 購入済み動画 */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold mb-2">🎬 購入済み動画</h2>
          {loadingVideos ? (
            <p className="text-gray-500">動画を読み込んでいます...</p>
          ) : purchasedVideos.length === 0 ? (
            <p className="text-gray-500">購入済み動画はまだありません。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mypage;

