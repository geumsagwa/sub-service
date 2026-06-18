"use client";

import React from "react";
import { useApp } from "../context/AppContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, toggleRole } = useApp();

  return (
    <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div 
          onClick={() => setActiveTab("feed")} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
            IB
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:opacity-90 transition-opacity">
            Insight<span className="text-indigo-500 font-semibold">Bridge</span>
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("feed")}
            className={`transition-colors py-1 hover-underline-animation cursor-pointer ${
              activeTab === "feed" || activeTab === "post-detail"
                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            피드 탐색
          </button>
          
          {currentUser.role === "creator" && (
            <button
              onClick={() => setActiveTab("creator-studio")}
              className={`transition-colors py-1 hover-underline-animation cursor-pointer ${
                activeTab === "creator-studio"
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              스튜디오 (글쓰기)
            </button>
          )}

          <button
            onClick={() => setActiveTab("my-library")}
            className={`transition-colors py-1 hover-underline-animation cursor-pointer ${
              activeTab === "my-library"
                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {currentUser.role === "admin" ? "정산 대시보드" : "내 서재"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => currentUser.role !== "reader" && toggleRole()}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentUser.role === "reader"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            독자
          </button>
          <button
            onClick={() => currentUser.role !== "creator" && toggleRole()}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentUser.role === "creator"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            작가
          </button>
          <button
            onClick={() => currentUser.role !== "admin" && toggleRole()}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentUser.role === "admin"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            관리자
          </button>
        </div>

        {/* User Info Profile */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-4">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.username}
            className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-slate-700"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
              {currentUser.username}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {currentUser.role === "creator" ? "Creator" : currentUser.role === "admin" ? "Platform Admin" : "Subscriber"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
