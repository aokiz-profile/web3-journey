'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useProgress } from '@/hooks/useProgress';
import { useStats } from '@/hooks/useStats';
import { generateLearningReport } from '@/lib/pdf/generateReport';

export function ExportReportButton() {
  const t = useTranslations('report');
  const locale = useLocale();
  const { user } = useAuthContext();
  const { learningProgress, projectProgress } = useProgress();
  const { stats } = useStats();
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    if (!user) {
      setMessage({ type: 'error', text: t('loginRequired') });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsExporting(true);
    setMessage(null);

    try {
      await generateLearningReport({
        userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        learningProgress,
        projectProgress,
        stats,
        locale: locale as 'zh' | 'en',
      });

      setMessage({ type: 'success', text: t('exportSuccess') });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: t('exportError') });
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('exporting')}
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {t('exportPdf')}
          </>
        )}
      </button>

      {/* Toast Message */}
      {message && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 px-4 py-2 rounded-lg text-sm font-medium text-center whitespace-nowrap ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-500 border border-green-500/30'
              : 'bg-red-500/10 text-red-500 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
