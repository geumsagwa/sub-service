"use client";

import React, { useState } from "react";

interface PaymentModalProps {
  creatorId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscribeToCreator: (creatorId: string, creatorName: string, amount: number) => Promise<boolean>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  creatorId,
  creatorName,
  isOpen,
  onClose,
  onSuccess,
  subscribeToCreator
}) => {
  const [method, setMethod] = useState<"card" | "toss" | "kakao" | "naver">("card");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const price = 9900; // Monthly subscription price

  if (!isOpen) return null;

  const handlePay = async () => {
    setStatus("processing");
    const result = await subscribeToCreator(creatorId, creatorName, price);
    if (result) {
      setStatus("success");
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus("idle");
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {status === "idle" && (
          <div>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="font-sans font-bold text-slate-800 dark:text-slate-200">InsightBridge 안전결제</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6 text-left">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">구독 상품 정보</span>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                  {creatorName.split(" ")[0]} 멤버십 월간 정기 구독
                </h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">9,900</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">원 / 월</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">결제 수단 선택</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setMethod("card")}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === "card"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    신용/체크카드
                  </button>
                  <button
                    onClick={() => setMethod("toss")}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === "toss"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    토스페이
                  </button>
                  <button
                    onClick={() => setMethod("kakao")}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === "kakao"
                        ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    카카오페이
                  </button>
                  <button
                    onClick={() => setMethod("naver")}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === "naver"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    네이버페이
                  </button>
                </div>
              </div>

              {/* Policy agreement */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                매월 9,900원이 정기 결제되며, 구독 해지는 마이페이지에서 언제든지 가능합니다. 구매 조건 및 개인정보 제3자 제공에 동의하시는 경우 결제하기를 클릭하세요.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary w-full cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handlePay}
                className="btn-primary w-full cursor-pointer"
              >
                결제하기
              </button>
            </div>
          </div>
        )}

        {status === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
            {/* Spinning Indicator */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-4">안전 결제 처리 중...</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PG 및 카드사 가맹점 통신망을 통해 거래를 승인하고 있습니다. 잠시만 기다려 주세요.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
            {/* Success Checkmark Ring */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shadow-inner">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-4">구독 결제 완료!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {creatorName.split(" ")[0]} 작가님의 유료 구독 멤버십 등록이 성공적으로 완료되었습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
