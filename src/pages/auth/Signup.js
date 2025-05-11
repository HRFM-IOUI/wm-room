import React from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../firebase";
import SectionBox from "../../components/ui/SectionBox";
import { createFreeSubscription } from "../../utils/stripeUtils";

const Signup = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google登録成功:", user);

      // サブスク作成処理を実行（内部で Stripe Checkout にリダイレクト）
      await createFreeSubscription(user.uid, user.email);

      // ※redirectToCheckout が発火するため navigate は通常不要ですが、保険で設置
      setTimeout(() => navigate("/thankyou?uid=" + user.uid), 5000);
    } catch (error) {
      alert("Google登録に失敗しました: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-theme-gray flex items-center justify-center px-4">
      <SectionBox className="w-full max-w-md rounded-2xl space-y-6">
        <h1 className="text-center text-3xl font-extrabold text-gray-800">新規登録</h1>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 bg-white border rounded-full py-2.5 px-4 hover:bg-gray-100 shadow transition text-sm font-semibold text-black"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Googleで登録 → 自動で加入
          </button>
        </div>

        <div className="text-sm text-center text-gray-600">
          または{" "}
          <a
            href="/signup/email"
            className="text-theme-pink hover:underline font-semibold"
          >
            メールアドレスで登録
          </a>
        </div>

        <p className="text-xs text-center text-gray-400">
          <a href="/lounge" className="hover:underline">
            ← Loungeに戻る
          </a>
        </p>
      </SectionBox>
    </div>
  );
};

export default Signup;