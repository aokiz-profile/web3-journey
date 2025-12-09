'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useProgress } from '@/hooks/useProgress';
import { Web3Provider, ConnectWallet } from '@/components/web3';
import { CertificateCard } from '@/components/certificate';
import { CertificateType, CERTIFICATE_TYPE_NAMES } from '@/lib/web3/config';
import type { MintableCertificate } from '@/lib/web3/types';
import { learningModules, type ModuleLevel } from '@/data/content';
import { projects } from '@/data/projects';
import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';

function CertificatesContent() {
  const t = useTranslations('certificate');
  const tModules = useTranslations('modules');
  const tProjects = useTranslations('projects');
  const locale = useLocale() as 'zh' | 'en';
  const { user } = useAuthContext();
  const { learningProgress, projectProgress } = useProgress();
  const { isConnected } = useAccount();
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'eligible' | 'minted'>('all');

  // Get module translation
  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  // Get project translation
  const getProjectTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('projects.', '');
      return tProjects(cleanKey as 'list.erc20.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  // Calculate mintable certificates
  const certificates = useMemo<MintableCertificate[]>(() => {
    const certs: MintableCertificate[] = [];

    // Module completion certificates
    learningModules.forEach(module => {
      const moduleTopics = learningProgress.filter(p => p.module_id === module.id);
      const completed = moduleTopics.filter(p => p.status === 'completed').length;
      const total = module.topics.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      certs.push({
        type: CertificateType.MODULE_COMPLETION,
        title: getModuleTranslation(module.titleKey),
        description: `${locale === 'zh' ? '完成' : 'Completed'} ${module.topics.length} ${locale === 'zh' ? '个知识点' : 'topics'}`,
        referenceId: module.id,
        completionPercentage: percentage,
        eligible: percentage === 100,
        minted: false, // TODO: Check from blockchain
      });
    });

    // Level completion certificates
    const levels: ModuleLevel[] = ['foundation', 'development', 'advanced', 'expert'];
    const levelNames: Record<ModuleLevel, { zh: string; en: string }> = {
      foundation: { zh: '基础入门阶段', en: 'Foundation Level' },
      development: { zh: '开发实践阶段', en: 'Development Level' },
      advanced: { zh: '高级进阶阶段', en: 'Advanced Level' },
      expert: { zh: '专家精通阶段', en: 'Expert Level' },
    };

    levels.forEach(level => {
      const levelModules = learningModules.filter(m => m.level === level);
      const totalTopics = levelModules.reduce((acc, m) => acc + m.topics.length, 0);
      const completedTopics = levelModules.reduce((acc, m) => {
        const moduleTopics = learningProgress.filter(p => p.module_id === m.id);
        return acc + moduleTopics.filter(p => p.status === 'completed').length;
      }, 0);
      const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      certs.push({
        type: CertificateType.LEVEL_COMPLETION,
        title: levelNames[level][locale],
        description: `${levelModules.length} ${locale === 'zh' ? '个模块' : 'modules'}, ${totalTopics} ${locale === 'zh' ? '个知识点' : 'topics'}`,
        referenceId: level,
        completionPercentage: percentage,
        eligible: percentage === 100,
        minted: false,
      });
    });

    // Project completion certificates
    projects.forEach(project => {
      const progress = projectProgress.find(p => p.project_id === project.id);
      const percentage = progress?.status === 'completed' ? 100 : progress?.status === 'in_progress' ? 50 : 0;

      certs.push({
        type: CertificateType.PROJECT_COMPLETION,
        title: getProjectTranslation(project.titleKey),
        description: getProjectTranslation(project.descriptionKey).slice(0, 50) + '...',
        referenceId: project.id,
        completionPercentage: percentage,
        eligible: percentage === 100,
        minted: false,
      });
    });

    // Course completion certificate
    const totalTopics = learningModules.reduce((acc, m) => acc + m.topics.length, 0);
    const completedTopics = learningProgress.filter(p => p.status === 'completed').length;
    const coursePercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    certs.push({
      type: CertificateType.COURSE_COMPLETION,
      title: locale === 'zh' ? 'Web3 全栈开发认证' : 'Web3 Full-Stack Developer',
      description: locale === 'zh' ? '完成所有课程内容和项目' : 'Complete all courses and projects',
      referenceId: 'full-course',
      completionPercentage: coursePercentage,
      eligible: coursePercentage === 100,
      minted: false,
    });

    return certs;
  }, [learningProgress, projectProgress, locale, tModules]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    switch (filter) {
      case 'eligible':
        return certificates.filter(c => c.eligible && !c.minted);
      case 'minted':
        return certificates.filter(c => c.minted);
      default:
        return certificates;
    }
  }, [certificates, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: certificates.length,
    eligible: certificates.filter(c => c.eligible && !c.minted).length,
    minted: certificates.filter(c => c.minted).length,
  }), [certificates]);

  const handleMint = async (cert: MintableCertificate) => {
    if (!isConnected) {
      alert(t('connectWalletFirst'));
      return;
    }

    setMintingId(cert.referenceId);
    try {
      // TODO: Implement actual minting logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(t('mintSuccess'));
    } catch (error) {
      console.error('Mint failed:', error);
      alert(t('mintError'));
    } finally {
      setMintingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{t('subtitle')}</p>

            <div className="max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">{t('loginRequired')}</h2>
              <p className="text-muted-foreground text-sm">
                {t('loginRequiredDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <ConnectWallet />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-2xl font-bold gradient-text">{stats.total}</div>
            <div className="text-sm text-muted-foreground">{t('totalCerts')}</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-2xl font-bold text-green-500">{stats.eligible}</div>
            <div className="text-sm text-muted-foreground">{t('eligibleToMint')}</div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.minted}</div>
            <div className="text-sm text-muted-foreground">{t('mintedCount')}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'gradient-bg text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {t('filterAll')} ({stats.total})
          </button>
          <button
            onClick={() => setFilter('eligible')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'eligible'
                ? 'bg-green-500 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {t('filterEligible')} ({stats.eligible})
          </button>
          <button
            onClick={() => setFilter('minted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'minted'
                ? 'bg-purple-500 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {t('filterMinted')} ({stats.minted})
          </button>
        </div>

        {/* Not Connected Warning */}
        {!isConnected && (
          <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
            <svg className="w-6 h-6 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-medium text-yellow-500">{t('walletNotConnected')}</div>
              <div className="text-sm text-muted-foreground">{t('connectToMint')}</div>
            </div>
          </div>
        )}

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <CertificateCard
              key={`${cert.type}-${cert.referenceId}`}
              certificate={cert}
              userName={userName}
              onMint={() => handleMint(cert)}
              isMinting={mintingId === cert.referenceId}
            />
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground">{t('noCertificates')}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
          <h2 className="text-xl font-semibold mb-4">{t('aboutNftCerts')}</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('whatIsNftCert')}</h3>
              <p>{t('whatIsNftCertDesc')}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('howToMint')}</h3>
              <p>{t('howToMintDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Web3Provider>
      <CertificatesContent />
    </Web3Provider>
  );
}
