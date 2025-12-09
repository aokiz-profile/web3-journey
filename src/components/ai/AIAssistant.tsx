'use client';

import { useState } from 'react';
import { AIChatPanel } from './AIChatPanel';
import { CodeReviewPanel } from './CodeReviewPanel';

export function AIAssistant() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleOpenChat = () => {
    setIsMenuOpen(false);
    setIsChatOpen(true);
  };

  const handleOpenReview = () => {
    setIsMenuOpen(false);
    setIsReviewOpen(true);
  };

  return (
    <>
      {/* Floating AI Button with Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2">
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[220px]">
              {/* Menu Header */}
              <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
                <h4 className="font-semibold text-sm">AI 助手</h4>
                <p className="text-xs text-muted-foreground">智能学习工具</p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* AI Chat Option */}
                <button
                  onClick={handleOpenChat}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">AI 问答助手</div>
                    <div className="text-xs text-muted-foreground">Web3 学习问答</div>
                  </div>
                </button>

                {/* Code Review Option */}
                <button
                  onClick={handleOpenReview}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">代码审计</div>
                    <div className="text-xs text-muted-foreground">智能合约安全分析</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative w-14 h-14 rounded-full gradient-bg text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
            isMenuOpen ? 'rotate-45' : ''
          }`}
          aria-label="AI Assistant"
        >
          {/* Pulse animation when menu is closed */}
          {!isMenuOpen && !isChatOpen && !isReviewOpen && (
            <span className="absolute inset-0 rounded-full gradient-bg animate-ping opacity-20 pointer-events-none" />
          )}
          {isMenuOpen ? (
            <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Chat Panel */}
      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Code Review Panel */}
      <CodeReviewPanel
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />
    </>
  );
}
