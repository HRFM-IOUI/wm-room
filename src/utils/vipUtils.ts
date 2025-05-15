import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const VIP_REF = (uid: string) => doc(db, 'vipStatus', uid);

const UTC_DAY = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const getInitialVipData = () => ({
  rank: 'Bronze',
  tickets: 0,
  gachaCount: 0,
  totalSpent: 0,
  points: 0,
  lastLoginAt: null,
  streak: 0,
});

export const getUserVipStatus = async (userId: string | null) => {
  if (!userId) return getInitialVipData();
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, getInitialVipData());
    return getInitialVipData();
  }
  return snap.data();
};

export const grantLoginBonus = async (userId: string | null): Promise<number | null> => {
  if (!userId) return null;
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  const today = UTC_DAY();

  if (!snap.exists()) {
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

  if (!lastLoginTS) {
    const bonus = 5;
    await updateDoc(ref, {
      points: (data.points || 0) + bonus,
      lastLoginAt: serverTimestamp(),
      streak: 1,
    });
    return bonus;
  }

  const lastLoginDay = new Date(Date.UTC(
    lastLoginTS.getUTCFullYear(),
    lastLoginTS.getUTCMonth(),
    lastLoginTS.getUTCDate()
  ));
  if (today <= lastLoginDay) return null;

  const newStreak = (data.streak || 0) + 1;
  const bonus = newStreak % 7 === 0 ? 100 : 5;

  await updateDoc(ref, {
    points: (data.points || 0) + bonus,
    lastLoginAt: serverTimestamp(),
    streak: newStreak,
  });

  return bonus;
};

export const recordGachaPlay = async (userId: string) => {
  if (!userId) return;
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const newCount = (data.gachaCount || 0) + 1;
  const newRank = newCount >= 10 || (data.totalSpent || 0) >= 10000 ? 'VIP12' : data.rank;

  await updateDoc(ref, {
    gachaCount: newCount,
    rank: newRank,
  });
};

export const recordPurchase = async (userId: string, amount: number) => {
  if (!userId) return;
  const ref = VIP_REF(userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const newTotal = (data.totalSpent || 0) + amount;
  const newRank = newTotal >= 10000 || (data.gachaCount || 0) >= 10 ? 'VIP12' : data.rank;

  await updateDoc(ref, {
    totalSpent: newTotal,
    rank: newRank,
  });
};

export const resetVipRank = async (userId: string) => {
  if (!userId) return;
  await updateDoc(VIP_REF(userId), { rank: 'Bronze' });
};
