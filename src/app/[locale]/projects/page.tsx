'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { projects, type ProjectDifficulty, getDifficultyStars } from '@/data/projects';
import { useProgressStore, type ProjectStatus } from '@/stores/progress';

const difficultyColors: Record<ProjectDifficulty, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  elementary: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  advanced: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  expert: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
};

const statusColors: Record<ProjectStatus, { bg: string; text: string }> = {
  not_started: { bg: 'bg-muted', text: 'text-muted-foreground' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-500' },
};

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProjectDifficulty | 'all'>('all');

  const { projectProgress, updateProjectStatus } = useProgressStore();

  const filteredProjects = projects.filter((project) => {
    return selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
  });

  const getProjectStatus = (projectId: string): ProjectStatus => {
    return projectProgress[projectId]?.status || 'not_started';
  };

  const handleStatusChange = (projectId: string, currentStatus: ProjectStatus) => {
    const statusOrder: ProjectStatus[] = ['not_started', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateProjectStatus(projectId, nextStatus);
  };

  const filters: { key: ProjectDifficulty | 'all'; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'beginner', label: t('difficulty.beginner') },
    { key: 'elementary', label: t('difficulty.elementary') },
    { key: 'intermediate', label: t('difficulty.intermediate') },
    { key: 'advanced', label: t('difficulty.advanced') },
    { key: 'expert', label: t('difficulty.expert') },
  ];

  const renderStars = (difficulty: ProjectDifficulty) => {
    const count = getDifficultyStars(difficulty);
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < count ? 'text-yellow-500' : 'text-muted'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedDifficulty(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === filter.key
                  ? 'gradient-bg text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const status = getProjectStatus(project.id);
            const colors = difficultyColors[project.difficulty];
            const statusStyle = statusColors[status];

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`block p-6 rounded-2xl bg-card border ${colors.border} card-hover`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {t(`difficulty.${project.difficulty}` as 'difficulty.beginner')}
                  </div>
                  {renderStars(project.difficulty)}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold mb-2">{t(project.titleKey.replace('projects.', '') as 'list.erc20.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t(project.descriptionKey.replace('projects.', '') as 'list.erc20.description')}</p>

                {/* Skills */}
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2">{t('skills')}</div>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md bg-secondary text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{project.estimatedHours}h
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleStatusChange(project.id, status);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'completed'
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : status === 'in_progress'
                        ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                        : 'gradient-bg text-white hover:opacity-90'
                    }`}
                  >
                    {status === 'not_started' && t('startProject')}
                    {status === 'in_progress' && t('status.inProgress')}
                    {status === 'completed' && t('status.completed')}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
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
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
