import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { loadStripe } from '@stripe/stripe-js';

// 環境変数に設定済みのStripe公開鍵
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// 1ヶ月無料サブスクのチェックアウト処理
export const createFreeSubscription = async (userId, userEmail) => {
  const stripe = await stripePromise;

  const response = await fetch('/create-free-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userEmail,
      coupon: 'GACHA_FREE_1M', // Stripeで作成したクーポン
    }),
  });

  const { sessionId } = await response.json();
  await stripe.redirectToCheckout({ sessionId });
};

// Firestoreにサブスク情報保存
export const saveUserSubscription = async (userId, subscriptionData) => {
  await setDoc(doc(db, `subscriptions/${userId}`), subscriptionData);
};
