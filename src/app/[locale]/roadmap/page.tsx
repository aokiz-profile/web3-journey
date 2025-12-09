'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { useProgress } from '@/hooks/useProgress';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { learningModules, type ModuleLevel } from '@/data/content';

interface PhaseModule {
  id: string;
  level: ModuleLevel;
}

interface Phase {
  id: number;
  titleKey: string;
  descriptionKey: string;
  milestoneKey: string;
  itemsKey: string;
  duration: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  bgColor: string;
  modules: PhaseModule[];
  icon: React.ReactNode;
}

// Progress ring component
function ProgressRing({ progress, size = 48, strokeWidth = 4, className = '' }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{progress}%</span>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const t = useTranslations('roadmap');
  const tModules = useTranslations('modules');
  const { user } = useAuthContext();
  const { learningProgress, getModuleProgress, loading } = useProgress();

  // Map modules to phases based on their level
  const foundationModules = learningModules.filter(m => m.level === 'foundation');
  const developmentModules = learningModules.filter(m => m.level === 'development');
  const advancedModules = learningModules.filter(m => m.level === 'advanced');
  const expertModules = learningModules.filter(m => m.level === 'expert');

  const phases: Phase[] = [
    {
      id: 1,
      titleKey: 'phases.phase1.title',
      descriptionKey: 'phases.phase1.description',
      milestoneKey: 'phases.phase1.milestone',
      itemsKey: 'phases.phase1.items',
      duration: '1-2',
      color: 'from-purple-500 to-indigo-500',
      gradientFrom: 'purple-500',
      gradientTo: 'indigo-500',
      bgColor: 'bg-purple-500',
      modules: foundationModules.map(m => ({ id: m.id, level: m.level })),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 2,
      titleKey: 'phases.phase2.title',
      descriptionKey: 'phases.phase2.description',
      milestoneKey: 'phases.phase2.milestone',
      itemsKey: 'phases.phase2.items',
      duration: '2-3',
      color: 'from-blue-500 to-cyan-500',
      gradientFrom: 'blue-500',
      gradientTo: 'cyan-500',
      bgColor: 'bg-blue-500',
      modules: developmentModules.map(m => ({ id: m.id, level: m.level })),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: 3,
      titleKey: 'phases.phase3.title',
      descriptionKey: 'phases.phase3.description',
      milestoneKey: 'phases.phase3.milestone',
      itemsKey: 'phases.phase3.items',
      duration: '2-3',
      color: 'from-cyan-500 to-green-500',
      gradientFrom: 'cyan-500',
      gradientTo: 'green-500',
      bgColor: 'bg-cyan-500',
      modules: advancedModules.map(m => ({ id: m.id, level: m.level })),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 4,
      titleKey: 'phases.phase4.title',
      descriptionKey: 'phases.phase4.description',
      milestoneKey: 'phases.phase4.milestone',
      itemsKey: 'phases.phase4.items',
      duration: '3+',
      color: 'from-orange-500 to-red-500',
      gradientFrom: 'orange-500',
      gradientTo: 'red-500',
      bgColor: 'bg-orange-500',
      modules: expertModules.map(m => ({ id: m.id, level: m.level })),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  // Calculate module completion status
  const getModuleCompletionStatus = (moduleId: string) => {
    const module = learningModules.find(m => m.id === moduleId);
    if (!module) return { completed: 0, total: 0, percentage: 0 };

    const moduleTopics = learningProgress.filter(p => p.module_id === moduleId);
    const completed = moduleTopics.filter(p => p.status === 'completed').length;
    const total = module.topics.length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // Calculate phase progress
  const getPhaseProgress = (phaseModules: PhaseModule[]) => {
    if (phaseModules.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let totalTopics = 0;
    let completedTopics = 0;

    phaseModules.forEach(pm => {
      const module = learningModules.find(m => m.id === pm.id);
      if (module) {
        totalTopics += module.topics.length;
        const moduleTopics = learningProgress.filter(p => p.module_id === pm.id);
        completedTopics += moduleTopics.filter(p => p.status === 'completed').length;
      }
    });

    return {
      completed: completedTopics,
      total: totalTopics,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    };
  };

  // Determine phase status
  const getPhaseStatus = (phase: Phase, phaseIndex: number) => {
    const progress = getPhaseProgress(phase.modules);

    if (progress.percentage === 100) return 'completed';
    if (progress.completed > 0) return 'in_progress';

    // Check if previous phase is completed (for unlock logic)
    if (phaseIndex === 0) return 'unlocked';

    const prevPhaseProgress = getPhaseProgress(phases[phaseIndex - 1].modules);
    if (prevPhaseProgress.percentage >= 50) return 'unlocked';

    return 'locked';
  };

  // Get module translation
  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  // Calculate overall progress
  const overallProgress = (() => {
    const totalTopics = learningModules.reduce((acc, m) => acc + m.topics.length, 0);
    const completedTopics = learningProgress.filter(p => p.status === 'completed').length;
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  })();

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Overall Progress Card */}
        {user && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ProgressRing progress={overallProgress} size={80} strokeWidth={6} />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-semibold mb-2">整体学习进度 / Overall Progress</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    已完成 {learningProgress.filter(p => p.status === 'completed').length} / {learningModules.reduce((acc, m) => acc + m.topics.length, 0)} 个知识点
                  </p>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {phases.filter((p, i) => getPhaseStatus(p, i) === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">已完成阶段</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {learningModules.filter(m => {
                        const status = getModuleCompletionStatus(m.id);
                        return status.percentage === 100;
                      }).length}
                    </div>
                    <div className="text-xs text-muted-foreground">已完成模块</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Timeline */}
        <div className="max-w-4xl mx-auto">
          {phases.map((phase, index) => {
            const status = user ? getPhaseStatus(phase, index) : (index === 0 ? 'unlocked' : 'locked');
            const progress = getPhaseProgress(phase.modules);
            const items = t.raw(phase.itemsKey) as string[];

            return (
              <div key={phase.id} className="relative">
                {/* Connector Line */}
                {index < phases.length - 1 && (
                  <div
                    className={`absolute left-6 top-16 w-0.5 h-full transition-colors ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-gradient-to-b from-green-500 to-border' :
                      'bg-border'
                    }`}
                  />
                )}

                {/* Phase Card */}
                <div className="relative flex gap-6 pb-12">
                  {/* Circle Indicator */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                      status === 'completed'
                        ? 'bg-green-500 shadow-lg shadow-green-500/30'
                        : status === 'in_progress'
                        ? `bg-gradient-to-br ${phase.color} shadow-lg animate-pulse`
                        : status === 'unlocked'
                        ? `bg-gradient-to-br ${phase.color}`
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {status === 'completed' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : status === 'locked' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      phase.icon
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 p-6 rounded-2xl border transition-all ${
                      status === 'in_progress'
                        ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                        : status === 'completed'
                        ? 'bg-card border-green-500/30'
                        : status === 'unlocked'
                        ? 'bg-card border-border hover:border-primary/30'
                        : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    {/* Phase Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'in_progress'
                            ? 'bg-primary/10 text-primary'
                            : status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : status === 'unlocked'
                            ? `bg-${phase.gradientFrom}/10 text-${phase.gradientFrom}`
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t('phase')} {phase.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('duration')}: {phase.duration} {t('months')}
                      </span>
                      {status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 animate-pulse">
                          {t('current')}
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          {t('completed')}
                        </span>
                      )}
                      {status === 'locked' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {t('locked')}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold mb-2">{t(phase.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t(phase.descriptionKey)}</p>

                    {/* Phase Progress Bar */}
                    {user && status !== 'locked' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {progress.completed}/{progress.total} 知识点
                          </span>
                          <span className="font-medium">{progress.percentage}%</span>
                        </div>
                        <div className="progress-bar h-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              status === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Learning Modules in this phase */}
                    {status !== 'locked' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          学习模块 / Modules
                        </h4>
                        <div className="grid gap-2">
                          {phase.modules.map((pm) => {
                            const module = learningModules.find(m => m.id === pm.id);
                            if (!module) return null;

                            const moduleStatus = getModuleCompletionStatus(pm.id);
                            const isCompleted = moduleStatus.percentage === 100;
                            const isInProgress = moduleStatus.completed > 0 && !isCompleted;

                            return (
                              <Link
                                key={pm.id}
                                href={`/content/${pm.id}`}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                  isCompleted
                                    ? 'bg-green-500/10 hover:bg-green-500/20'
                                    : isInProgress
                                    ? 'bg-blue-500/10 hover:bg-blue-500/20'
                                    : 'bg-secondary hover:bg-secondary/80'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isInProgress
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {isCompleted ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    moduleStatus.percentage > 0 ? `${moduleStatus.percentage}` : '·'
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isCompleted ? 'text-green-600 dark:text-green-400' :
                                    isInProgress ? 'text-blue-600 dark:text-blue-400' : ''
                                  }`}>
                                    {getModuleTranslation(module.titleKey)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {moduleStatus.completed}/{moduleStatus.total} 知识点
                                  </p>
                                </div>
                                {user && (
                                  <div className="text-xs text-muted-foreground">
                                    {module.hours}h
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Original Items (hidden when modules shown) */}
                    {status === 'locked' && (
                      <div className="space-y-2 mb-4">
                        {items.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${phase.bgColor}`} />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Milestone */}
                    <div
                      className={`p-4 rounded-xl ${
                        status === 'completed'
                          ? 'bg-green-500/10 border border-green-500/20'
                          : status === 'in_progress'
                          ? 'bg-primary/10 border border-primary/20'
                          : status === 'unlocked'
                          ? 'bg-secondary border border-border'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {t('milestone')}
                        {status === 'completed' && (
                          <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className={`text-sm ${status === 'locked' ? 'text-muted-foreground' : ''}`}>
                        {t(phase.milestoneKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="max-w-4xl mx-auto mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
            <p className="text-muted-foreground mb-2">
              登录后可以追踪学习进度和解锁里程碑
            </p>
            <p className="text-sm text-muted-foreground">
              Login to track your progress and unlock milestones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
