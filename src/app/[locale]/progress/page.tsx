'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { useProgress } from '@/hooks/useProgress';
import { useStats } from '@/hooks/useStats';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { learningModules, type ModuleLevel } from '@/data/content';
import { projects } from '@/data/projects';
import { achievements as allAchievements, getUnlockedAchievements, getLockedAchievements } from '@/data/achievements';
import { ExportReportButton } from '@/components/report/ExportReportButton';

const levelColors: Record<ModuleLevel, { bg: string; text: string }> = {
  foundation: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  development: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  advanced: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  expert: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
};

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 8, className = '' }: {
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
        <span className="text-xs text-muted-foreground">完成度</span>
      </div>
    </div>
  );
}

// Skills Radar Component
function SkillsRadar({ skills }: { skills: { label: string; value: number }[] }) {
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;

  const points = skills.map((skill, index) => {
    const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
    const radius = (skill.value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      labelX: centerX + (maxRadius + 20) * Math.cos(angle),
      labelY: centerY + (maxRadius + 20) * Math.sin(angle),
      label: skill.label,
      value: skill.value,
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
      {/* Background circles */}
      {[20, 35, 50, 70].map((r) => (
        <circle
          key={r}
          cx={centerX}
          cy={centerY}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
        />
      ))}

      {/* Axis lines */}
      {skills.map((_, index) => {
        const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={centerX + maxRadius * Math.cos(angle)}
            y2={centerY + maxRadius * Math.sin(angle)}
            stroke="currentColor"
            strokeOpacity="0.1"
          />
        );
      })}

      {/* Skills area */}
      <path
        d={pathD}
        fill="url(#radarGradient)"
        fillOpacity="0.3"
        stroke="url(#radarGradient)"
        strokeWidth="2"
      />

      {/* Points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#8b5cf6"
        />
      ))}

      {/* Labels */}
      {points.map((point, index) => (
        <text
          key={index}
          x={point.labelX}
          y={point.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] fill-muted-foreground"
        >
          {point.label}
        </text>
      ))}

      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProgressPage() {
  const t = useTranslations('progress');
  const tModules = useTranslations('modules');
  const tAchievements = useTranslations('achievements');
  const tStats = useTranslations('stats');
  const { user } = useAuthContext();
  const {
    learningProgress,
    projectProgress,
    getTotalCompletedTopics,
    loading
  } = useProgress();
  const { currentStreak, longestStreak, achievements: userAchievements } = useStats();

  // Get unlocked and locked achievements
  const unlockedAchievements = getUnlockedAchievements(userAchievements);
  const lockedAchievements = getLockedAchievements(userAchievements);

  // Calculate total topics
  const totalTopics = learningModules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = learningProgress.filter(p => p.status === 'completed').length;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Calculate module statistics
  const moduleStats = learningModules.map(module => {
    const moduleTopics = learningProgress.filter(p => p.module_id === module.id);
    const completed = moduleTopics.filter(p => p.status === 'completed').length;
    const total = module.topics.length;
    return {
      ...module,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Calculate level statistics
  const levelStats = (['foundation', 'development', 'advanced', 'expert'] as ModuleLevel[]).map(level => {
    const levelModules = moduleStats.filter(m => m.level === level);
    const totalInLevel = levelModules.reduce((acc, m) => acc + m.total, 0);
    const completedInLevel = levelModules.reduce((acc, m) => acc + m.completed, 0);
    return {
      level,
      total: totalInLevel,
      completed: completedInLevel,
      percentage: totalInLevel > 0 ? Math.round((completedInLevel / totalInLevel) * 100) : 0,
      moduleCount: levelModules.length,
      completedModules: levelModules.filter(m => m.percentage === 100).length,
    };
  });

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    completed: projectProgress.filter(p => p.status === 'completed').length,
    inProgress: projectProgress.filter(p => p.status === 'in_progress').length,
    notStarted: projects.length - projectProgress.length,
  };

  // Calculate skills based on completed modules
  const calculateSkills = () => {
    const skills = {
      blockchain: 0,
      solidity: 0,
      frontend: 0,
      security: 0,
      defi: 0,
      nft: 0,
    };

    // Map modules to skills
    const moduleSkillMap: Record<string, (keyof typeof skills)[]> = {
      'blockchain-basics': ['blockchain'],
      'ethereum-fundamentals': ['blockchain'],
      'web3-ecosystem': ['blockchain', 'defi', 'nft'],
      'solidity-programming': ['solidity'],
      'contract-security': ['security', 'solidity'],
      'dev-toolchain': ['solidity', 'frontend'],
      'frontend-integration': ['frontend'],
      'defi-development': ['defi', 'solidity'],
      'nft-development': ['nft', 'solidity'],
      'layer2-development': ['blockchain', 'solidity'],
      'contract-upgrades': ['solidity', 'security'],
      'mev-arbitrage': ['defi', 'security'],
      'crosschain-development': ['blockchain'],
      'zk-applications': ['blockchain', 'security'],
    };

    moduleStats.forEach(module => {
      const relatedSkills = moduleSkillMap[module.id] || [];
      relatedSkills.forEach(skill => {
        skills[skill] = Math.min(100, skills[skill] + (module.percentage / relatedSkills.length) * (100 / Object.keys(moduleSkillMap).filter(k => moduleSkillMap[k].includes(skill)).length));
      });
    });

    return Object.entries(skills).map(([key, value]) => ({
      key,
      label: t(`skills.${key}` as 'skills.blockchain'),
      value: Math.round(value),
    }));
  };

  const skillsData = calculateSkills();

  // Get module translation
  const getModuleTranslation = (key: string) => {
    try {
      const cleanKey = key.replace('modules.', '');
      return tModules(cleanKey as 'blockchainBasics.title');
    } catch {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  // Get level translation
  const getLevelTranslation = (level: ModuleLevel) => {
    const levelNames: Record<ModuleLevel, string> = {
      foundation: '基础入门',
      development: '开发实践',
      advanced: '高级进阶',
      expert: '专家精通',
    };
    return levelNames[level];
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
              <h2 className="text-xl font-semibold mb-2">登录查看进度</h2>
              <p className="text-muted-foreground text-sm mb-4">
                登录后可以追踪学习进度、查看技能统计和解锁成就
              </p>
              <p className="text-muted-foreground text-xs">
                Login to track your progress, view skill stats, and unlock achievements
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-responsive">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
          <div className="mt-6 flex justify-center">
            <ExportReportButton />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t('overview.totalProgress')}</div>
                <div className="text-3xl font-bold gradient-text">{overallProgress}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {completedTopics}/{totalTopics} 知识点
                </div>
              </div>
              <ProgressRing progress={overallProgress} size={80} strokeWidth={6} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">{t('overview.completedModules')}</div>
            <div className="text-3xl font-bold gradient-text">
              {moduleStats.filter(m => m.percentage === 100).length}/{learningModules.length}
            </div>
            <div className="mt-3 flex gap-1">
              {moduleStats.map((m, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    m.percentage === 100 ? 'bg-green-500' :
                    m.percentage > 0 ? 'bg-blue-500' :
                    'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">已完成项目</div>
            <div className="text-3xl font-bold gradient-text">
              {projectStats.completed}/{projectStats.total}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {projectStats.inProgress} 个进行中
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">预计学时</div>
            <div className="text-3xl font-bold gradient-text">
              {learningModules.reduce((acc, m) => acc + m.hours, 0)}h
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              共 {learningModules.length} 个模块
            </div>
          </div>
        </div>

        {/* Streak and Achievements Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Streak Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">🔥</span>
                  <span className="text-lg font-medium">{tStats('streak')}</span>
                </div>
                <div className="text-5xl font-bold text-orange-500 mb-1">
                  {currentStreak}
                  <span className="text-lg font-normal text-muted-foreground ml-1">{tStats('days')}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {tStats('longestStreak')}: {longestStreak} {tStats('days')}
                </div>
              </div>
              <div className="text-right">
                {currentStreak > 0 ? (
                  <div className="text-sm text-green-500 font-medium">{tStats('keepItUp')}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">开始学习来记录连续天数</div>
                )}
              </div>
            </div>
          </div>

          {/* Achievements Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-lg font-medium">{tAchievements('title')}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {unlockedAchievements.length}/{allAchievements.length} {tAchievements('unlocked')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center text-lg shadow-lg`}
                  title={tAchievements(`${achievement.id.replace(/_/g, '')}.title` as 'firstStep.title')}
                >
                  {achievement.icon}
                </div>
              ))}
              {lockedAchievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg opacity-30"
                  title={tAchievements(`${achievement.id.replace(/_/g, '')}.title` as 'firstStep.title')}
                >
                  {achievement.icon}
                </div>
              ))}
              {lockedAchievements.length > 5 && (
                <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{lockedAchievements.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Radar */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-semibold mb-6">{t('skills.title')}</h2>

            <div className="flex justify-center mb-6">
              <SkillsRadar skills={skillsData} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {skillsData.map((skill) => (
                <div key={skill.key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{skill.label}</span>
                      <span className="text-xs font-medium">{skill.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Progress */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-semibold mb-6">阶段进度 / Level Progress</h2>

            <div className="space-y-4">
              {levelStats.map((stat) => (
                <div key={stat.level} className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[stat.level].bg} ${levelColors[stat.level].text}`}>
                        {getLevelTranslation(stat.level)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stat.completedModules}/{stat.moduleCount} 模块
                      </span>
                    </div>
                    <span className="text-sm font-medium">{stat.percentage}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.completed}/{stat.total} 知识点
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Details */}
        <div className="p-6 rounded-2xl bg-card border border-border mb-8">
          <h2 className="text-xl font-semibold mb-6">模块详情 / Module Details</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleStats.map((module) => (
              <Link
                key={module.id}
                href={`/content/${module.id}`}
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  module.percentage === 100
                    ? 'bg-green-500/5 border-green-500/30 hover:border-green-500/50'
                    : module.percentage > 0
                    ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
                    : 'bg-secondary/30 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[module.level].bg} ${levelColors[module.level].text}`}>
                    {getLevelTranslation(module.level)}
                  </span>
                  {module.percentage === 100 && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <h3 className="font-medium mb-1 truncate">
                  {getModuleTranslation(module.titleKey)}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{module.completed}/{module.total} 知识点</span>
                  <span>{module.hours}h</span>
                </div>
                <div className="progress-bar h-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      module.percentage === 100 ? 'bg-green-500' :
                      module.percentage > 0 ? 'bg-blue-500' :
                      'bg-muted'
                    }`}
                    style={{ width: `${module.percentage}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Full Achievements Section */}
        <div className="p-6 rounded-2xl bg-card border border-border mb-8">
          <h2 className="text-xl font-semibold mb-6">{tAchievements('title')} / Achievements</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAchievements.map((achievement) => {
              const isUnlocked = userAchievements.includes(achievement.id);
              // Convert snake_case to camelCase for translation key
              const keyBase = achievement.id.replace(/_(\w)/g, (_, c) => c.toUpperCase());

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${achievement.color} border-transparent shadow-lg`
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        isUnlocked ? 'bg-white/20' : 'bg-muted/50'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${isUnlocked ? 'text-white' : ''}`}>
                        {tAchievements(`${keyBase}.title` as 'firstStep.title')}
                      </div>
                      <div className={`text-sm ${isUnlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {tAchievements(`${keyBase}.description` as 'firstStep.description')}
                      </div>
                      {isUnlocked && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-white/70">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tAchievements('unlocked')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-semibold mb-6">最近活动 / Recent Activity</h2>

          {learningProgress.length === 0 ? (
            <div className="text-center py-8">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-muted-foreground mb-4">{t('recent.noRecord')}</p>
              <Link
                href="/content"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-white text-sm font-medium"
              >
                {t('recent.startNow')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {[...learningProgress]
                .sort((a, b) => {
                  const dateA = a.updated_at || a.created_at || '';
                  const dateB = b.updated_at || b.created_at || '';
                  return dateB.localeCompare(dateA);
                })
                .slice(0, 10)
                .map((progress, index) => {
                  const module = learningModules.find(m => m.id === progress.module_id);
                  const topic = module?.topics.find(t => t.id === progress.topic_id);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {topic ? getModuleTranslation(topic.titleKey) : progress.topic_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {module ? getModuleTranslation(module.titleKey) : progress.module_id}
                          {' · '}
                          {progress.updated_at
                            ? new Date(progress.updated_at).toLocaleDateString('zh-CN')
                            : '-'}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                          progress.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : progress.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {progress.status === 'completed' ? '已完成' :
                         progress.status === 'in_progress' ? '进行中' : '未开始'}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
