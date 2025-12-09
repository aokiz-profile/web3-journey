'use client';

import { useTranslations } from 'next-intl';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { getModuleById, getModuleDependencies, type ModuleLevel, type Resource } from '@/data/content';
import { useProgress } from '@/hooks/useProgress';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { VideoLink } from '@/components/ui/VideoPlayer';
import { NotePanel } from '@/components/notes/NotePanel';
import type { ProgressStatus } from '@/lib/supabase/types';

const levelColors: Record<ModuleLevel, { bg: string; text: string; border: string }> = {
  foundation: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  development: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  advanced: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
  expert: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
};

const statusColors: Record<ProgressStatus, { bg: string; text: string; icon: string }> = {
  not_started: { bg: 'bg-muted', text: 'text-muted-foreground', icon: 'circle' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: 'clock' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-500', icon: 'check' },
};

const resourceIcons: Record<Resource['type'], React.ReactNode> = {
  doc: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  article: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  github: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  ),
};

interface ModuleDetailPageProps {
  params: Promise<{ moduleId: string }>;
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { moduleId } = use(params);
  const t = useTranslations('content');
  const tModules = useTranslations('modules');
  const tNotes = useTranslations('notes');
  const { user } = useAuthContext();
  const { getLearningStatus, updateLearningProgress, syncing } = useProgress();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const module = getModuleById(moduleId);

  if (!module) {
    notFound();
  }

  const prerequisites = getModuleDependencies(moduleId);
  const colors = levelColors[module.level];

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleStatusToggle = async (topicId: string, currentStatus: ProgressStatus) => {
    if (!user) return;

    const statusOrder: ProgressStatus[] = ['not_started', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    await updateLearningProgress(moduleId, topicId, nextStatus);
  };

  const completedTopics = module.topics.filter(
    (topic) => getLearningStatus(moduleId, topic.id) === 'completed'
  ).length;
  const progressPercent = Math.round((completedTopics / module.topics.length) * 100);

  const getTopicTranslation = (titleKey: string) => {
    try {
      return tModules(titleKey.replace('modules.', '') as 'blockchainBasics.title');
    } catch {
      return titleKey.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || titleKey;
    }
  };

  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive max-w-4xl">
        {/* Back Button */}
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('title')}
        </Link>

        {/* Module Header */}
        <div className={`p-8 rounded-2xl bg-card border ${colors.border} mb-8`}>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {t(`filter${module.level.charAt(0).toUpperCase() + module.level.slice(1)}` as 'filterFoundation')}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {module.hours} {t('hours')}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {module.topics.length} {t('topics')}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {getModuleTranslation(module.titleKey)}
          </h1>
          <p className="text-muted-foreground text-lg">
            {getModuleTranslation(module.descriptionKey)}
          </p>

          {/* Progress Bar */}
          {user && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {completedTopics}/{module.topics.length} {t('topics')}
                </span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                前置知识 / Prerequisites
              </h3>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq) => (
                  <Link
                    key={prereq.id}
                    href={`/content/${prereq.id}`}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${levelColors[prereq.level].bg} ${levelColors[prereq.level].text} hover:opacity-80`}
                  >
                    {getModuleTranslation(prereq.titleKey)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            知识点列表 / Topics
          </h2>

          {module.topics.map((topic, index) => {
            const status = user ? getLearningStatus(moduleId, topic.id) : 'not_started';
            const statusStyle = statusColors[status];
            const isExpanded = expandedTopics.has(topic.id);
            const hasResources = topic.resources && topic.resources.length > 0;

            return (
              <div
                key={topic.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Topic Header */}
                <div
                  className={`flex items-center gap-4 p-4 ${hasResources ? 'cursor-pointer hover:bg-secondary/50' : ''} transition-colors`}
                  onClick={() => hasResources && toggleTopic(topic.id)}
                >
                  {/* Index Number */}
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium shrink-0">
                    {index + 1}
                  </div>

                  {/* Topic Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {getTopicTranslation(topic.titleKey)}
                    </h3>
                    {topic.descriptionKey && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {getTopicTranslation(topic.descriptionKey)}
                      </p>
                    )}
                  </div>

                  {/* Status Button */}
                  {user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(topic.id, status);
                      }}
                      disabled={syncing}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} hover:opacity-80 transition-opacity shrink-0`}
                    >
                      {t(`status.${status === 'not_started' ? 'notStarted' : status === 'in_progress' ? 'inProgress' : 'completed'}` as 'status.notStarted')}
                    </button>
                  )}

                  {/* Expand Arrow */}
                  {hasResources && (
                    <svg
                      className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                {/* Resources Panel */}
                {hasResources && isExpanded && (
                  <div className="border-t border-border bg-secondary/30 p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      学习资源 / Resources
                    </h4>
                    <div className="grid gap-3">
                      {topic.resources!.map((resource, rIndex) => (
                        resource.type === 'video' ? (
                          <VideoLink
                            key={rIndex}
                            url={resource.url}
                            title={resource.title}
                          />
                        ) : (
                          <a
                            key={rIndex}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary transition-colors group"
                          >
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'doc' ? 'bg-blue-500/10 text-blue-500' :
                              resource.type === 'article' ? 'bg-green-500/10 text-green-500' :
                              'bg-purple-500/10 text-purple-500'
                            }`}>
                              {resourceIcons[resource.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {resource.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                              </p>
                            </div>
                            <svg
                              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Module Notes Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {tNotes('moduleNotes')}
          </h2>
          <NotePanel
            referenceType="module"
            referenceId={moduleId}
            title={tNotes('moduleNotes')}
          />
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
            <p className="text-muted-foreground mb-2">
              登录后可以追踪学习进度
            </p>
            <p className="text-sm text-muted-foreground">
              Login to track your learning progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
