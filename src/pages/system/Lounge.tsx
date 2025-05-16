// src/pages/system/Lounge.js
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';

const Lounge = () => {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* 固定ヘッダー */}
      <header className="w-full fixed top-0 z-50 bg-white shadow-md flex items-center justify-between px-4 py-2">
        <div className="text-xl font-bold">ToaFansShop</div>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm font-semibold hover:underline">
            ログイン
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-pink-500 text-white px-4 py-1 rounded hover:bg-pink-600"
          >
            新規登録
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full pt-16">
        {/* Heroセクション */}
        <section className="relative w-full h-[90vh] overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            src=""
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />
          <div className="relative z-20 flex flex-col justify-center items-center text-white text-center px-4 h-full">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              TOA-FANS.SHOPは、クリエイターTOAが提供する
              <br />
              エンタメプロジェクトを楽しむ会員制オンラインサロンです
            </h1>
            <p className="text-sm md:text-lg mb-6 drop-shadow-md max-w-2xl">
              ※公開前のプロジェクトが多いため、内容は秘密厳守。違反があった場合は法的措置を取る可能性があります。
            </p>
            <Link
              to="/signup"
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full text-lg"
            >
              はじめてみる
            </Link>
          </div>
        </section>

        {/* サービス紹介セクション */}
        <section className="bg-gray-100 py-12 px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">提供中のコンテンツ</h2>
          <p className="text-gray-700 max-w-xl mx-auto mb-8">
            本オンラインサロンでは、会員限定の映像・音声・イラスト・イベントへの参加機会など、
            ファンとクリエイターがつながる特別な体験を提供しています。
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/3">
              <h3 className="font-semibold text-lg mb-2">限定デジタルコンテンツ</h3>
              <p className="text-sm text-gray-600">
                音楽・動画・イラストなどのオリジナル作品を毎月配信。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/3">
              <h3 className="font-semibold text-lg mb-2">会員限定イベント</h3>
              <p className="text-sm text-gray-600">
                オンラインZoomイベントやリアルイベント（トーク・サイン会など）も開催予定。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/3">
              <h3 className="font-semibold text-lg mb-2">制作舞台裏シェア</h3>
              <p className="text-sm text-gray-600">
                制作中のプロジェクトの裏側や進捗を会員限定で公開。
              </p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-sm text-gray-700">
              月額制プランの詳細は以下のリンクよりご確認いただけます。
            </p>
            <Link
              to="/subscribe"
              className="text-pink-600 underline hover:text-pink-800 text-sm"
            >
              サブスクメニューを見る
            </Link>
          </div>
          <p className="text-xs text-gray-500 text-center mt-8 px-4">
            当サービスで提供されるすべてのコンテンツは、クリエイター本人によって制作された合法的なオリジナル作品です。法令遵守のもと、健全なファンコミュニティの形成を目指しています。
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Lounge;