"use client";

import React, { useState, useEffect } from "react";
import { useApp, Post } from "../context/AppContext";
import { Navbar } from "../components/Navbar";
import { PaymentModal } from "../components/PaymentModal";
import { MockPanel } from "../components/MockPanel";

export default function Home() {
  const {
    currentUser,
    posts,
    subscriptions,
    payments,
    payouts,
    publishPost,
    subscribeToCreator,
    cancelSubscription,
    updatePayoutAccount,
    executePayout
  } = useApp();

  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // Payment Modal State
  const [paymentTarget, setPaymentTarget] = useState<{ id: string; name: string } | null>(null);
  const [showPaySuccessToast, setShowPaySuccessToast] = useState(false);

  // Admin Payout State
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  // Payout Account Form State
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isEditingBank, setIsEditingBank] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setBankName(currentUser.bank_name || "");
      setAccountNumber(currentUser.account_number || "");
      setAccountHolder(currentUser.account_holder || "");
    }
  }, [currentUser]);

  // Creator Studio Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("개발");
  const [isPremium, setIsPremium] = useState(true);
  const [previewContent, setPreviewContent] = useState("");
  const [fullContent, setFullContent] = useState("");

  const categories = ["전체", "개발", "디자인", "마케팅", "비즈니스"];

  // Filter posts based on category
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "전체") return true;
    return post.category === selectedCategory;
  });

  // Check if current user is subscribed to a post's creator
  const isSubscribedToCreator = (creatorId: string) => {
    // Creator is always allowed to read their own posts
    if (creatorId === currentUser.id) return true;
    return subscriptions.some(
      (sub) => sub.creator_id === creatorId && sub.status === "active"
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !previewContent || !fullContent) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    publishPost(title, category, isPremium, previewContent, fullContent);
    
    // Reset Form
    setTitle("");
    setCategory("개발");
    setIsPremium(true);
    setPreviewContent("");
    setFullContent("");

    // Move to feed
    setActiveTab("feed");
    setActivePostId(null);
  };

  const triggerSubscribe = (creatorId: string, creatorName: string) => {
    setPaymentTarget({ id: creatorId, name: creatorName });
  };

  const handlePaymentSuccess = () => {
    setShowPaySuccessToast(true);
    setTimeout(() => {
      setShowPaySuccessToast(false);
    }, 4000);
  };

  // Switch tab cleanup
  useEffect(() => {
    if (activeTab !== "feed") {
      setActivePostId(null);
    }
  }, [activeTab]);

  // Scroll to top when activePostId changes
  useEffect(() => {
    if (activePostId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activePostId]);

  // Find active post
  const activePost = posts.find((p) => p.id === activePostId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors text-slate-800 dark:text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        
        {/* TOAST NOTIFICATION */}
        {showPaySuccessToast && (
          <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-400">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold">구독 결제가 승인되었습니다. 이제 본문을 무제한 열람할 수 있습니다!</span>
          </div>
        )}

        {/* FEED TAB */}
        {activeTab === "feed" && (
          <div>
            {!activePostId ? (
              // 1. Article List Grid View
              <div className="animate-fade-in">
                {/* Hero Header */}
                <div className="text-center md:text-left py-12 px-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white mb-10 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent_45%)]"></div>
                  <div className="relative z-10 max-w-2xl">
                    <span className="text-xs font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase">
                      InsightBridge Premium Curation
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 leading-tight">
                      현업 최전선 전문가들의 <br />
                      검증된 실무 노하우를 정기 배송받으세요.
                    </h1>
                    <p className="text-slate-300 mt-4 text-sm md:text-base leading-relaxed">
                      광고나 낚시성 뉴스 대신 지식 콘텐츠 구독으로 커리어를 업그레이드하세요. 
                      원하는 크리에이터를 구독하고 막힘없이 고급 인사이틀을 누리세요.
                    </p>
                  </div>
                </div>

                {/* Categories & Filter */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Article Grid Layout */}
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPosts.map((post) => {
                      const hasSub = isSubscribedToCreator(post.creator_id);
                      return (
                        <article
                          key={post.id}
                          onClick={() => setActivePostId(post.id)}
                          className="glass-card p-6 flex flex-col justify-between cursor-pointer"
                        >
                          <div className="flex flex-col gap-3 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">
                                {post.category}
                              </span>
                              {post.is_premium && (
                                <span className={`badge-premium ${hasSub ? "opacity-75" : ""}`}>
                                  {hasSub ? "🔓 구독열람" : "🔒 프리미엄"}
                                </span>
                              )}
                            </div>
                            <h2 className="text-lg font-bold font-sans text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1">
                              {post.title}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              {post.preview_content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-6">
                            <div className="flex items-center gap-2">
                              <img
                                src={post.creator_avatar}
                                alt={post.creator_name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {post.creator_name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {new Date(post.created_at).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center glass-card">
                    <p className="text-slate-400 font-semibold">선택한 카테고리에 발행된 아티클이 없습니다.</p>
                  </div>
                )}
              </div>
            ) : (
              // 2. Article Detailed View with Paywall Logic
              <div className="animate-fade-in max-w-3xl mx-auto bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 md:p-12 shadow-sm text-left">
                {activePost && (
                  <div>
                    {/* Back Button */}
                    <button
                      onClick={() => setActivePostId(null)}
                      className="mb-8 flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      목록으로 돌아가기
                    </button>

                    {/* Metadata */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-wider text-indigo-600 bg-indigo-500/10 dark:bg-indigo-400/15 dark:text-indigo-400 px-3 py-1 rounded-full uppercase">
                        {activePost.category}
                      </span>
                      {activePost.is_premium && (
                        <span className="badge-premium">PREMIUM</span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight font-serif text-slate-950 dark:text-white mt-4 leading-tight">
                      {activePost.title}
                    </h1>

                    {/* Creator Info */}
                    <div className="flex items-center justify-between py-6 my-6 border-y border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={activePost.creator_avatar}
                          alt={activePost.creator_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{activePost.creator_name}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">실무 전문가 작가</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400 dark:text-slate-500">
                        <div>{new Date(activePost.created_at).toLocaleDateString("ko-KR")}</div>
                        <div className="mt-1">⏱️ 약 5분 소요</div>
                      </div>
                    </div>

                    {/* Article Content Render */}
                    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                      {activePost.is_premium && !isSubscribedToCreator(activePost.creator_id) ? (
                        // PAYWALL VIEW
                        <div className="paywall-container">
                          {/* Partially visible body preview */}
                          <div className="opacity-80 select-none pointer-events-none whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
                            {activePost.preview_content}
                          </div>
                          
                          {/* Paywall Blurry Block Overlay */}
                          <div className="paywall-fade">
                            <div className="w-full max-w-lg mx-auto p-6 md:p-8 bg-slate-900/95 dark:bg-slate-950 text-white rounded-2xl border border-slate-700/60 shadow-2xl text-center flex flex-col items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <div className="flex flex-col gap-1">
                                <h3 className="font-sans font-bold text-base md:text-lg">이 아티클의 남은 70% 분량은 유료 독자 전용입니다.</h3>
                                <p className="text-xs text-slate-400">
                                  {activePost.creator_name.split(" ")[0]} 크리에이터의 구독 멤버십에 가입하시면 즉시 본 아티클을 포함한 모든 한정 지식을 제한 없이 보실 수 있습니다.
                                </p>
                              </div>
                              <button
                                onClick={() => triggerSubscribe(activePost.creator_id, activePost.creator_name)}
                                className="btn-primary w-full mt-2 cursor-pointer font-bold py-3 text-sm shadow-md"
                              >
                                월 9,900원에 작가 구독하기
                              </button>
                              <span className="text-[10px] text-slate-500">
                                안전한 토스페이먼츠 간편결제 연동 | 언제든 1초 해지 보장
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // FULL CONTENTS VIEW
                        <div className="whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base space-y-6">
                          {/* Formatting simulation with simple HTML elements or line splits */}
                          {activePost.content.split("\n\n").map((para, idx) => {
                            if (para.startsWith("###")) {
                              return (
                                <h3 key={idx} className="text-lg md:text-xl font-bold font-sans text-slate-950 dark:text-white mt-8 mb-4 border-l-4 border-indigo-600 pl-3">
                                  {para.replace("###", "").trim()}
                                </h3>
                              );
                            }
                            return (
                              <p key={idx} className="mb-4 text-slate-700 dark:text-slate-300">
                                {para}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CREATOR STUDIO TAB */}
        {activeTab === "creator-studio" && currentUser.role === "creator" && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-sm animate-fade-in text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">크리에이터 지식 발행 에디터</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">
              독자들에게 실무 노하우를 전달하고 새로운 구독 팬덤을 만드세요.
            </p>

            {!currentUser.bank_name && (
              <div className="mb-6 p-4 bg-amber-550/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center gap-3 text-xs leading-relaxed">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <strong>정산용 계좌 정보가 등록되지 않았습니다.</strong> 독자가 결제한 구독료를 정상적으로 정산받으려면 
                  <button type="button" onClick={() => setActiveTab("my-library")} className="underline font-bold ml-1 hover:text-indigo-500 cursor-pointer">
                    내 서재에서 정산 계좌를 설정
                  </button>해 주세요.
                </div>
              </div>
            )}

            <form onSubmit={handlePublish} className="flex flex-col gap-6">
              {/* Title Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">아티클 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 프론트엔드 성능을 극대화하는 5가지 렌더링 최적화 노하우"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-colors"
                />
              </div>

              {/* Category & Premium Option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-colors"
                  >
                    <option value="개발">개발</option>
                    <option value="디자인">디자인</option>
                    <option value="마케팅">마케팅</option>
                    <option value="비즈니스">비즈니스</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">공개 범위 설정</label>
                  <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 h-[46px]">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">유료 구독자 전용 공개 (Premium)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPremium}
                        onChange={(e) => setIsPremium(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview Content TextArea */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  무료 맛보기 / 요약 소개 문구 (페이월 이전 공개 영역)
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="독자가 아티클에 흥미를 느끼도록 서론 및 핵심 요약을 제공하세요. 비구독자에게 페이월 위에 노출됩니다."
                  value={previewContent}
                  onChange={(e) => setPreviewContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-indigo-500 text-xs leading-relaxed transition-colors editor-textarea"
                />
              </div>

              {/* Full Content TextArea */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  본문 전체 내용 (유료 구독자 전용 본문)
                </label>
                <textarea
                  required
                  rows={10}
                  placeholder="### 1. 첫번째 핵심 내용 요약&#10;본문에 들어갈 마크다운 문구를 편하게 작성하세요. 줄바꿈과 '### 제목'을 지원합니다."
                  value={fullContent}
                  onChange={(e) => setFullContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-indigo-500 text-xs leading-relaxed transition-colors editor-textarea"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("feed")}
                  className="btn-secondary font-bold text-xs"
                >
                  작성 취소
                </button>
                <button
                  type="submit"
                  className="btn-primary font-bold text-xs"
                >
                  🚀 아티클 발행하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MY LIBRARY TAB */}
        {activeTab === "my-library" && (
          <div className="animate-fade-in text-left">
            {currentUser.role === "admin" ? (
              // ADMIN FINANCIAL & SETTLEMENT DASHBOARD
              <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">플랫폼 재무 및 정산 관리 센터</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  지식 콘텐츠 구독 플랫폼 InsightBridge의 누적 거래 대금 집계와 크리에이터별 정산(펌뱅킹 송금)을 처리합니다.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">누적 거래액 (GMV)</span>
                    <h2 className="text-xl md:text-2xl font-extrabold mt-1 text-indigo-400">
                      {(payments.reduce((sum, p) => sum + p.amount, 0) + 39600).toLocaleString()}원
                    </h2>
                    <span className="text-[9px] text-slate-400 mt-2 block">독자 결제 금액 합계</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">플랫폼 수수료 수입 (10%)</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                      {Math.round((payments.reduce((sum, p) => sum + p.amount, 0) + 39600) * 0.1).toLocaleString()}원
                    </h2>
                    <span className="text-[9px] text-slate-400 mt-2 block">플랫폼 순매출 수입</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">정산 대기 금액 (90%)</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-amber-500 mt-1">
                      {payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}원
                    </h2>
                    <span className="text-[9px] text-slate-400 mt-2 block">작가 정산 예정 잔액</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">정산 완료 금액</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-emerald-500 mt-1">
                      {payouts.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}원
                    </h2>
                    <span className="text-[9px] text-slate-400 mt-2 block">지급 완료 총액</span>
                  </div>
                </div>

                {/* Payout Logs Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">크리에이터 정산 송금 대장</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                          <th className="py-3 px-4">크리에이터</th>
                          <th className="py-3 px-4">정산 계좌 정보</th>
                          <th className="py-3 px-4 text-right">정산 금액 (90%)</th>
                          <th className="py-3 px-4">상태</th>
                          <th className="py-3 px-4 text-center">펌뱅킹 실행</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                        {payouts.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                              {pay.creator_name}
                            </td>
                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                              <div className="font-bold text-slate-700 dark:text-slate-300">{pay.bank_name}</div>
                              <div className="font-mono mt-0.5">{pay.account_number} (예금주: {pay.account_holder})</div>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-slate-950 dark:text-white">
                              {pay.amount.toLocaleString()}원
                            </td>
                            <td className="py-4 px-4">
                              {pay.status === "paid" ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 font-bold px-2 py-1 rounded-md text-[10px]">
                                  ✓ 송금완료
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 font-bold px-2 py-1 rounded-md text-[10px]">
                                  ⏰ 정산대기
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {pay.status === "pending" ? (
                                <button
                                  disabled={processingPayoutId === pay.id}
                                  onClick={async () => {
                                    if (confirm(`${pay.creator_name} 작가님 계좌(${pay.bank_name})로 ${pay.amount.toLocaleString()}원을 송금하시겠습니까?`)) {
                                      setProcessingPayoutId(pay.id);
                                      await executePayout(pay.id);
                                      setProcessingPayoutId(null);
                                      alert("송금 이체가 완료되었습니다.");
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    processingPayoutId === pay.id
                                      ? "bg-slate-100 text-slate-400 border border-slate-200"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                  }`}
                                >
                                  {processingPayoutId === pay.id ? "송금 중..." : "송금 실행"}
                                </button>
                              ) : (
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                  {new Date(pay.paid_at || "").toLocaleDateString("ko-KR")} 이체 완료
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // READERS & CREATORS PERSONAL VIEWS
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">내 서재 및 멤버십 설정</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  내가 구독 중인 크리에이터와 결제 승인 내역을 투명하게 확인 및 관리합니다.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 1. Subscribed Creators Column */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">현재 정기 구독 중인 작가</h3>
                      {subscriptions.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {subscriptions.map((sub) => {
                            const subCreatorPosts = posts.filter(p => p.creator_id === sub.creator_id);
                            const creatorName = subCreatorPosts[0]?.creator_name || "전문가 크리에이터";
                            const creatorAvatar = subCreatorPosts[0]?.creator_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                            return (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={creatorAvatar}
                                    alt={creatorName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{creatorName}</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">구독 만료일: {new Date(sub.current_period_end).toLocaleDateString("ko-KR")}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm("구독을 취소하시겠습니까? 다음 결제일 전까지는 열람이 가능합니다.")) {
                                      cancelSubscription(sub.creator_id);
                                    }
                                  }}
                                  className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  구독 해지
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400 font-semibold text-sm">
                          아직 구독 중인 크리에이터가 없습니다. <br />
                          <button
                            onClick={() => setActiveTab("feed")}
                            className="mt-3 text-indigo-500 font-bold hover:underline cursor-pointer"
                          >
                            아티클 둘러보고 구독하기
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Optional: Written Posts by Creator */}
                    {currentUser.role === "creator" && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">내가 발행한 아티클</h3>
                        {posts.filter(p => p.creator_id === currentUser.id).length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {posts
                              .filter(p => p.creator_id === currentUser.id)
                              .map((post) => (
                                <div
                                  key={post.id}
                                  onClick={() => {
                                    setActiveTab("feed");
                                    setActivePostId(post.id);
                                  }}
                                  className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl hover:border-indigo-400 border border-transparent transition-all cursor-pointer flex justify-between items-center"
                                >
                                  <div className="flex flex-col gap-1 max-w-[80%]">
                                    <span className="text-[10px] text-indigo-500 font-bold tracking-wider">{post.category}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{post.title}</span>
                                  </div>
                                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 shrink-0 font-bold">
                                    {post.is_premium ? "유료" : "무료"}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="py-10 text-center text-slate-400 font-semibold text-sm">
                            아직 발행한 아티클이 없습니다.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payout Bank Account Settings */}
                    {currentUser.role === "creator" && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            💰 크리에이터 정산 계좌 설정
                          </h3>
                          {!isEditingBank && currentUser.bank_name && (
                            <button
                              onClick={() => setIsEditingBank(true)}
                              className="text-xs text-indigo-500 font-bold hover:underline cursor-pointer"
                            >
                              수정하기
                            </button>
                          )}
                        </div>

                        {!currentUser.bank_name || isEditingBank ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!bankName || !accountNumber || !accountHolder) {
                                alert("모든 정보를 입력해 주세요.");
                                return;
                              }
                              updatePayoutAccount(bankName, accountNumber, accountHolder);
                              setIsEditingBank(false);
                              alert("정산 계좌가 등록되었습니다.");
                            }}
                            className="flex flex-col gap-4 text-left"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">은행명</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="예: 신한은행"
                                  value={bankName}
                                  onChange={(e) => setBankName(e.target.value)}
                                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">예금주</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="예: 이동욱"
                                  value={accountHolder}
                                  onChange={(e) => setAccountHolder(e.target.value)}
                                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">계좌번호</label>
                              <input
                                type="text"
                                required
                                placeholder="예: 110-384-293847"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              {currentUser.bank_name && (
                                <button
                                  type="button"
                                  onClick={() => setIsEditingBank(false)}
                                  className="text-xs bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 px-3.5 py-2 rounded-xl font-bold cursor-pointer"
                                >
                                  취소
                                </button>
                              )}
                              <button
                                type="submit"
                                className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 cursor-pointer"
                              >
                                계좌 저장
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2 text-left">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">{currentUser.bank_name}</span>
                              <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">✓ 인증완료</span>
                            </div>
                            <div className="flex flex-col text-left gap-1 mt-1 text-xs">
                              <div>
                                <span className="text-slate-400">계좌번호:</span>{" "}
                                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{currentUser.account_number}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">예금주:</span>{" "}
                                <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.account_holder}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Receipts Sidebar Column */}
                  <div className="flex flex-col">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">구독 결제 영수증 (Toss Pay)</h3>
                      {payments.length > 0 ? (
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1">
                          {payments.map((pay) => (
                            <div
                              key={pay.id}
                              className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2 relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                              <div className="flex justify-between items-start text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">{pay.creator_name.split(" ")[0]} 작가 구독</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{pay.amount.toLocaleString()}원</span>
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 space-y-1">
                                <div>거래번호: {pay.pg_tid}</div>
                                <div>일시: {new Date(pay.created_at).toLocaleString("ko-KR")}</div>
                                <div className="text-emerald-500 font-bold">✓ 정기승인완료 (TossPayments)</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400 text-sm">
                          결제 승인 이력이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 mt-16 text-center text-xs text-slate-400 dark:text-slate-600">
        <div>&copy; {new Date().getFullYear()} InsightBridge MVP Demo. All rights reserved.</div>
        <div className="mt-1">Built with Next.js & Supabase simulation.</div>
      </footer>

      {/* POPUPS & PORTALS */}
      {paymentTarget && (
        <PaymentModal
          creatorId={paymentTarget.id}
          creatorName={paymentTarget.name}
          isOpen={true}
          onClose={() => setPaymentTarget(null)}
          onSuccess={handlePaymentSuccess}
          subscribeToCreator={subscribeToCreator}
        />
      )}

      {/* FLOAT DEMO CONTROLLER */}
      <MockPanel />
    </div>
  );
}
