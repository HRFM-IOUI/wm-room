// src/pages/user/Mypage.js
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { getGachaHistory } from '../../utils/gachaUtils';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getUserVipStatus } from '../../utils/vipUtils';
import { useNavigate } from 'react-router-dom';

const Mypage = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [vipStatus, setVipStatus] = useState({
    rank: 'Bronze',
    points: 0,
    gachaCount: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (!user) return;
    // ガチャ履歴取得
    const fetchData = async () => {
      try {
        const results = await getGachaHistory(user.uid);
        setHistory(results);

        // ユーザードキュメントを確認（owner判定）
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
    // 注文履歴を取得
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
    // VIPステータス取得
    const fetchVip = async () => {
      if (!user) return;
      const vs = await getUserVipStatus(user.uid);
      setVipStatus(vs);
    };
    fetchVip();
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

          {/* ✅ 管理者ボタン復元 */}
          {isOwner && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              管理画面へ
            </button>
          )}
        </div>

        {/* VIPステータス表示 */}
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

        {/* ガチャ履歴 */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold mb-2">ガチャ履歴</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">履歴がありません。</p>
          ) : (
            <ul className="space-y-4 text-sm text-gray-700">
              {history.map((entry, index) => (
                <li key={index} className="border p-3 rounded bg-white">
                  <p className="text-xs text-gray-500 mb-2">
                    {entry.timestamp?.toDate().toLocaleString()}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {entry.results.map((item, i) => (
                      <div key={i} className="text-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mx-auto text-sm text-gray-600 rounded">
                            No Img
                          </div>
                        )}
                        <p className="text-xs mt-1">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mypage;