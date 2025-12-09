'use client';

import { useTranslations } from 'next-intl';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { getProjectById, getDifficultyStars, type ProjectDifficulty, type ProjectResource } from '@/data/projects';
import { getModuleById } from '@/data/content';
import { useProgress } from '@/hooks/useProgress';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { NotePanel } from '@/components/notes/NotePanel';
import type { ProgressStatus } from '@/lib/supabase/types';

const difficultyColors: Record<ProjectDifficulty, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  elementary: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  advanced: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  expert: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
};

const statusColors: Record<ProgressStatus, { bg: string; text: string }> = {
  not_started: { bg: 'bg-muted', text: 'text-muted-foreground' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-500' },
};

const resourceIcons: Record<ProjectResource['type'], React.ReactNode> = {
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

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params);
  const t = useTranslations('projects');
  const tModules = useTranslations('modules');
  const tNotes = useTranslations('notes');
  const { user } = useAuthContext();
  const { getProjectStatus, updateProjectProgress, syncing } = useProgress();
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [showUrlForm, setShowUrlForm] = useState(false);

  const project = getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const colors = difficultyColors[project.difficulty];
  const status = user ? getProjectStatus(projectId) : 'not_started';
  const statusStyle = statusColors[status];

  const handleStatusChange = async (newStatus: ProgressStatus) => {
    if (!user) return;
    await updateProjectProgress(projectId, newStatus, {
      githubUrl: githubUrl || undefined,
      demoUrl: demoUrl || undefined,
    });
  };

  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  const renderStars = (difficulty: ProjectDifficulty) => {
    const count = getDifficultyStars(difficulty);
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < count ? 'text-yellow-500' : 'text-muted'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const prerequisites = project.prerequisites?.map((id) => getModuleById(id)).filter(Boolean) || [];

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive max-w-4xl">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('title')}
        </Link>

        {/* Project Header */}
        <div className={`p-8 rounded-2xl bg-card border ${colors.border} mb-8`}>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {t(`difficulty.${project.difficulty}` as 'difficulty.beginner')}
            </span>
            {renderStars(project.difficulty)}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {t(project.titleKey as 'list.erc20.title')}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            {t(project.descriptionKey as 'list.erc20.description')}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>~{project.estimatedHours} 小时 / hours</span>
            </div>
            {user && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {status === 'not_started' && t('status.notStarted')}
                {status === 'in_progress' && t('status.inProgress')}
                {status === 'completed' && t('status.completed')}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('skills')}</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex flex-wrap gap-3">
              {status === 'not_started' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={syncing}
                  className="px-6 py-2.5 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {t('startProject')}
                </button>
              )}
              {status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setShowUrlForm(!showUrlForm)}
                    className="px-6 py-2.5 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                  >
                    添加链接 / Add Links
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={syncing}
                    className="px-6 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                  >
                    标记完成 / Mark Complete
                  </button>
                </>
              )}
              {status === 'completed' && (
                <button
                  onClick={() => handleStatusChange('not_started')}
                  disabled={syncing}
                  className="px-6 py-2.5 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  重新开始 / Restart
                </button>
              )}
            </div>
          )}

          {/* URL Form */}
          {showUrlForm && user && (
            <div className="mt-6 p-4 rounded-xl bg-secondary/50 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Demo URL</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={() => {
                  handleStatusChange(status);
                  setShowUrlForm(false);
                }}
                className="px-4 py-2 rounded-lg gradient-bg text-white text-sm font-medium"
              >
                保存 / Save
              </button>
            </div>
          )}
        </div>

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">前置知识 / Prerequisites</h2>
            <div className="grid gap-3">
              {prerequisites.map((module) => module && (
                <Link
                  key={module.id}
                  href={`/content/${module.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{getModuleTranslation(module.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{module.hours} 小时</p>
                  </div>
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {project.resources && project.resources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">学习资源 / Resources</h2>
            <div className="grid gap-3">
              {project.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className={`p-2.5 rounded-lg ${
                    resource.type === 'doc' ? 'bg-blue-500/10 text-blue-500' :
                    resource.type === 'video' ? 'bg-red-500/10 text-red-500' :
                    resource.type === 'article' ? 'bg-green-500/10 text-green-500' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {resourceIcons[resource.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Project Notes Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{tNotes('projectNotes')}</h2>
          <NotePanel
            referenceType="project"
            referenceId={projectId}
            title={tNotes('projectNotes')}
          />
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
            <p className="text-muted-foreground mb-2">
              登录后可以追踪项目进度
            </p>
            <p className="text-sm text-muted-foreground">
              Login to track your project progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
