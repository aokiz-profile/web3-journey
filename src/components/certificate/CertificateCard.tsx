'use client';

import { useTranslations, useLocale } from 'next-intl';
import { CertificateType, CERTIFICATE_TYPE_NAMES } from '@/lib/web3/config';
import type { MintableCertificate } from '@/lib/web3/types';

interface CertificateCardProps {
  certificate: MintableCertificate;
  userName: string;
  onMint?: () => void;
  isMinting?: boolean;
}

export function CertificateCard({ certificate, userName, onMint, isMinting }: CertificateCardProps) {
  const t = useTranslations('certificate');
  const locale = useLocale() as 'zh' | 'en';

  const typeInfo = CERTIFICATE_TYPE_NAMES[certificate.type];
  const typeName = typeInfo[locale];

  const getGradientByType = (type: CertificateType) => {
    switch (type) {
      case CertificateType.MODULE_COMPLETION:
        return 'from-blue-500 to-cyan-500';
      case CertificateType.LEVEL_COMPLETION:
        return 'from-purple-500 to-pink-500';
      case CertificateType.PROJECT_COMPLETION:
        return 'from-green-500 to-emerald-500';
      case CertificateType.COURSE_COMPLETION:
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIconByType = (type: CertificateType) => {
    switch (type) {
      case CertificateType.MODULE_COMPLETION:
        return '📚';
      case CertificateType.LEVEL_COMPLETION:
        return '🎯';
      case CertificateType.PROJECT_COMPLETION:
        return '🛠️';
      case CertificateType.COURSE_COMPLETION:
        return '🏆';
      default:
        return '📜';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all ${
      certificate.eligible && !certificate.minted
        ? 'border-primary/50 hover:border-primary shadow-lg hover:shadow-xl'
        : certificate.minted
        ? 'border-green-500/50 bg-green-500/5'
        : 'border-border opacity-60'
    }`}>
      {/* Certificate Preview */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${getGradientByType(certificate.type)} p-6`}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`pattern-${certificate.referenceId}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${certificate.referenceId})`} />
          </svg>
        </div>

        {/* Certificate Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center">
          <span className="text-4xl mb-2">{getIconByType(certificate.type)}</span>
          <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
            {t('certificateOf')}
          </div>
          <h3 className="text-lg font-bold mb-2">{typeName}</h3>
          <div className="text-sm opacity-90 mb-3 px-4 line-clamp-2">
            {certificate.title}
          </div>
          <div className="text-xs opacity-80">
            {t('awardedTo')}
          </div>
          <div className="font-semibold mt-1">{userName}</div>
        </div>

        {/* Minted Badge */}
        {certificate.minted && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('minted')}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{t('completion')}</span>
          <span className="text-sm font-medium">{certificate.completionPercentage}%</span>
        </div>

        <div className="progress-bar h-1.5 mb-4">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getGradientByType(certificate.type)} transition-all`}
            style={{ width: `${certificate.completionPercentage}%` }}
          />
        </div>

        {certificate.minted ? (
          <button
            disabled
            className="w-full py-2 px-4 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('alreadyMinted')}
          </button>
        ) : certificate.eligible ? (
          <button
            onClick={onMint}
            disabled={isMinting}
            className="w-full py-2 px-4 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isMinting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('minting')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('mintNft')}
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-2 px-4 rounded-lg bg-muted/50 text-muted-foreground text-sm text-center">
            {t('completeToUnlock')}
          </div>
        )}
      </div>
    </div>
  );
}
