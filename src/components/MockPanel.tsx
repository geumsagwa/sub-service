"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const MockPanel: React.FC = () => {
  const { currentUser, subscriptions, payments } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 cursor-pointer"
        title="MVP 데모 가이드 및 데이터 제어"
      >
        {isOpen ? (
          <span className="text-lg font-bold">&times;</span>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        )}
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="w-80 mt-3 p-5 bg-slate-950/95 text-slate-200 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-4 text-left text-xs leading-relaxed">
          <div>
            <h4 className="font-sans font-bold text-sm text-indigo-400">InsightBridge MVP 데모 센터</h4>
            <p className="text-slate-400 mt-1">본 서비스는 목업 데이터를 활용한 프론트엔드 기능 완전 작동 프로토타입입니다.</p>
          </div>

          <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
            <span className="font-semibold text-slate-300">💡 시나리오 체험 방법</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">독자 모드</strong>: 프리미엄 아티클 클릭 시 페이월 차단이 발동하며, 결제 완료 후 본문을 완독할 수 있습니다.
              </li>
              <li>
                <strong className="text-slate-200">작가 모드</strong>: 상단 네비에서 전환 후 직접 콘텐츠를 기획/작성해 실시간으로 발행할 수 있습니다.
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-slate-400">현재 로그인 역할:</span>
              <span className="font-bold text-indigo-300">{currentUser.role === "reader" ? "일반 독자" : "크리에이터"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">구독 중인 작가 수:</span>
              <span className="font-bold text-white">{subscriptions.filter(s => s.status === "active").length} 명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">결제 완료 건수:</span>
              <span className="font-bold text-white">{payments.length} 건</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full mt-1 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-red-300 py-2 rounded-xl transition-colors font-semibold cursor-pointer text-center"
          >
            체험 데이터 초기화 (Reset All)
          </button>
        </div>
      )}
    </div>
  );
};
