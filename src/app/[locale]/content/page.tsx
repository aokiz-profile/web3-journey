'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { learningModules, type ModuleLevel } from '@/data/content';
import { useProgressStore, type LearningStatus } from '@/stores/progress';

const levelColors: Record<ModuleLevel, { bg: string; text: string; border: string }> = {
  foundation: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  development: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  advanced: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
  expert: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
};

const statusColors: Record<LearningStatus, { bg: string; text: string }> = {
  not_started: { bg: 'bg-muted', text: 'text-muted-foreground' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-500' },
  mastered: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
};

export default function ContentPage() {
  const t = useTranslations('content');
  const tModules = useTranslations('modules');
  const [selectedLevel, setSelectedLevel] = useState<ModuleLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  const { moduleProgress, updateModuleStatus } = useProgressStore();

  const filteredModules = learningModules.filter((module) => {
    const matchesLevel = selectedLevel === 'all' || module.level === selectedLevel;
    const matchesSearch = module.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getModuleStatus = (moduleId: string): LearningStatus => {
    return moduleProgress[moduleId]?.status || 'not_started';
  };

  const handleStatusChange = (moduleId: string, currentStatus: LearningStatus) => {
    const statusOrder: LearningStatus[] = ['not_started', 'in_progress', 'completed', 'mastered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateModuleStatus(moduleId, nextStatus);
  };

  const filters: { key: ModuleLevel | 'all'; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'foundation', label: t('filterFoundation') },
    { key: 'development', label: t('filterDevelopment') },
    { key: 'advanced', label: t('filterAdvanced') },
    { key: 'expert', label: t('filterExpert') },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedLevel(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedLevel === filter.key
                    ? 'gradient-bg text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const status = getModuleStatus(module.id);
            const colors = levelColors[module.level];
            const statusStyle = statusColors[status];

            return (
              <Link
                key={module.id}
                href={`/content/${module.id}`}
                className={`block p-6 rounded-2xl bg-card border ${colors.border} card-hover`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {t(`filter${module.level.charAt(0).toUpperCase() + module.level.slice(1)}` as 'filterFoundation')}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleStatusChange(module.id, status);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} hover:opacity-80 transition-opacity`}
                  >
                    {t(`status.${
                      status === 'not_started' ? 'notStarted' :
                      status === 'in_progress' ? 'inProgress' :
                      status
                    }` as 'status.notStarted')}
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold mb-2">
                  {getModuleTranslation(module.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {getModuleTranslation(module.descriptionKey)}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {module.hours} {t('hours')}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {module.topics.length} {t('topics')}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar mb-4">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${
                        status === 'completed' || status === 'mastered'
                          ? 100
                          : status === 'in_progress'
                          ? 50
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {/* Topics Preview */}
                <div className="flex flex-wrap gap-2">
                  {module.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic.id}
                      className="px-2 py-1 rounded-md bg-secondary text-xs"
                    >
                      {topic.id.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {module.topics.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                      +{module.topics.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-muted-foreground">No modules found</p>
          </div>
        )}
      </div>
    </div>
  );
}
