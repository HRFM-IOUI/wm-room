// src/utils/vipUtils.js
// VIPランク管理・ログインボーナス・ガチャ回数・サブスク特典など、
// 「meta/login」を使わず、vipStatus/{uid} のみで管理する実装

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// vipStatus/{uid} に集約
const VIP_REF = (uid) => doc(db, 'vipStatus', uid);

const UTC_DAY = () => {
  const now = new Date();
  // UTCの年月日で0時を作成
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const getInitialVipData = () => ({
  rank: 'Bronze',
  tickets: 0,
  gachaCount: 0,
  totalSpent: 0,
  points: 0,
  lastLoginAt: null,  // ログイン日
  streak: 0,          // 連続ログイン数
});

/**
 * VIP情報を取得（存在しなければ初期化）
 */
export const getUserVipStatus = async (userId) => {
  if (!userId) return getInitialVipData();

  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, getInitialVipData());
    return getInitialVipData();
  }
  return snap.data();
};

/**
 * ログインボーナスを付与
 * - vipStatus/{uid} の lastLoginAt, streak, pointsを更新
 */
export const grantLoginBonus = async (userId) => {
  if (!userId) return null;
  const ref = VIP_REF(userId);

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // 初期化ドキュメントを作り、初回ログインボーナス 5pt とする
    const initData = {
      ...getInitialVipData(),
      points: 5,
      lastLoginAt: serverTimestamp(),
      streak: 1,
    };
    await setDoc(ref, initData);
    return 5;
  }

  const data = snap.data();
  const lastLoginTS = data.lastLoginAt?.toDate?.() || null;
  const today = UTC_DAY();

  // まだログイン日が無ければ、とりあえず初回ボーナス
  if (!lastLoginTS) {
    const streak = 1;
    const bonus = 5;
    await updateDoc(ref, {
      points: (data.points || 0) + bonus,
      lastLoginAt: serverTimestamp(),
      streak,
    });
    return bonus;
  }

  // すでに同じ日かどうか判定
  const lastLoginDay = new Date(Date.UTC(
    lastLoginTS.getUTCFullYear(),
    lastLoginTS.getUTCMonth(),
    lastLoginTS.getUTCDate()
  ));
  const isNewDay = today > lastLoginDay;  // today のほうが大きければ翌日以降
  if (!isNewDay) {
    // 同日内に既に受け取り済み
    return null;
  }

  // 日が変わっていれば streak++
  const newStreak = (data.streak || 0) + 1;
  // 7日目ごとに100pt、それ以外 5pt
  const bonus = newStreak % 7 === 0 ? 100 : 5;

  await updateDoc(ref, {
    points: (data.points || 0) + bonus,
    lastLoginAt: serverTimestamp(),
    streak: newStreak,
  });

  return bonus;
};

/**
 * ガチャ回数加算 + VIP昇格判定
 */
export const recordGachaPlay = async (userId) => {
  if (!userId) return;
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const newCount = (data.gachaCount || 0) + 1;

  // VIP判定
  let newRank = data.rank;
  if (newCount >= 10 || (data.totalSpent || 0) >= 10000) {
    newRank = 'VIP12';
  }

  await updateDoc(ref, {
    gachaCount: newCount,
    rank: newRank,
  });
};

/**
 * 金額を加算して VIP昇格判定
 */
export const recordPurchase = async (userId, amount) => {
  if (!userId) return;
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const newTotal = (data.totalSpent || 0) + amount;

  let newRank = data.rank;
  if (newTotal >= 10000 || (data.gachaCount || 0) >= 10) {
    newRank = 'VIP12';
  }

  await updateDoc(ref, {
    totalSpent: newTotal,
    rank: newRank,
  });
};

/**
 * サブスク解除時にランクをリセットする
 */
export const resetVipRank = async (userId) => {
  if (!userId) return;
  await updateDoc(VIP_REF(userId), { rank: 'Bronze' });
};