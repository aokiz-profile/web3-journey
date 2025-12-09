'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';

interface ReviewResult {
  summary: string;
  score: {
    security: number;
    gasEfficiency: number;
    codeQuality: number;
    overall: number;
  };
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    title: string;
    description: string;
    line?: string;
    suggestion?: string;
  }>;
  highlights: string[];
  recommendations: string[];
  rawResponse?: boolean;
}

interface CodeReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Potential reentrancy vulnerability!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }
}`;

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-500 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
};

export function CodeReviewPanel({ isOpen, onClose }: CodeReviewPanelProps) {
  const t = useTranslations('codeReview');
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [language, setLanguage] = useState('solidity');
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;

    setIsReviewing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error('Review failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(t('error'));
      console.error('Review error:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div className="fixed inset-4 md:inset-8 lg:inset-12 z-[70] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">{t('title')}</h3>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Code Input */}
          <div className="flex-1 flex flex-col p-4 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-sm"
                >
                  <option value="solidity">Solidity</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <button
                onClick={handleReview}
                disabled={isReviewing || !code.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isReviewing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('reviewing')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {t('startReview')}
                  </>
                )}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('codePlaceholder')}
              className="flex-1 w-full p-4 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm resize-none"
              spellCheck={false}
            />
          </div>

          {/* Results */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4">
                {error}
              </div>
            )}

            {!result && !isReviewing && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-muted-foreground">{t('noResults')}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid grid-cols-4 gap-3">
                  {['security', 'gasEfficiency', 'codeQuality', 'overall'].map((key) => (
                    <div key={key} className="p-3 rounded-xl bg-secondary text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score[key as keyof typeof result.score])}`}>
                        {result.score[key as keyof typeof result.score]}
                      </div>
                      <div className="text-xs text-muted-foreground">{t(`scores.${key}`)}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-secondary">
                  <h4 className="font-medium mb-2">{t('summary')}</h4>
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{result.summary}</ReactMarkdown>
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">{t('issues')} ({result.issues.length})</h4>
                    <div className="space-y-3">
                      {result.issues.map((issue, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border ${SEVERITY_COLORS[issue.severity]}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-medium">{issue.title}</span>
                            <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-current/10">
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm opacity-80 mb-2">{issue.description}</p>
                          {issue.suggestion && (
                            <div className="text-sm p-2 rounded bg-black/10">
                              <span className="font-medium">Fix: </span>
                              {issue.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {result.highlights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">{t('highlights')}</h4>
                    <ul className="space-y-2">
                      {result.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">{t('recommendations')}</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
