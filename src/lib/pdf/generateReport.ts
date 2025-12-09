'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { learningModules, type LearningModule } from '@/data/content';
import { projects } from '@/data/projects';
import { achievements as allAchievements } from '@/data/achievements';
import type { LearningProgress, ProjectProgress, UserStats, AchievementId } from '@/lib/supabase/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface ReportData {
  userName: string;
  userEmail: string;
  learningProgress: LearningProgress[];
  projectProgress: ProjectProgress[];
  stats: UserStats | null;
  locale: 'zh' | 'en';
}

interface ModuleStats {
  module: LearningModule;
  completedTopics: number;
  totalTopics: number;
  percentage: number;
}

// Color palette
const colors = {
  primary: [139, 92, 246] as [number, number, number], // Purple
  secondary: [59, 130, 246] as [number, number, number], // Blue
  success: [34, 197, 94] as [number, number, number], // Green
  warning: [234, 179, 8] as [number, number, number], // Yellow
  danger: [239, 68, 68] as [number, number, number], // Red
  muted: [107, 114, 128] as [number, number, number], // Gray
  dark: [31, 41, 55] as [number, number, number], // Dark gray
  light: [249, 250, 251] as [number, number, number], // Light gray
};

const translations = {
  zh: {
    title: 'Web3 学习报告',
    subtitle: '学习进度与成就总结',
    generatedAt: '生成时间',
    overview: '学习概览',
    totalProgress: '总体进度',
    completedModules: '完成模块',
    completedTopics: '完成知识点',
    completedProjects: '完成项目',
    currentStreak: '连续学习',
    longestStreak: '最长连续',
    days: '天',
    moduleProgress: '模块进度详情',
    module: '模块',
    level: '等级',
    progress: '进度',
    status: '状态',
    projectProgress: '项目完成情况',
    project: '项目',
    difficulty: '难度',
    achievements: '获得成就',
    achievementName: '成就名称',
    achievementDesc: '描述',
    levels: {
      foundation: '基础层',
      development: '开发层',
      advanced: '进阶层',
      expert: '专家层',
    },
    difficulties: {
      beginner: '入门',
      elementary: '初级',
      intermediate: '中级',
      advanced: '高级',
      expert: '专家',
    },
    statuses: {
      not_started: '未开始',
      in_progress: '进行中',
      completed: '已完成',
    },
    footer: 'Web3 学习之路 - 系统化的 Web3 学习路径',
    noData: '暂无数据',
  },
  en: {
    title: 'Web3 Learning Report',
    subtitle: 'Progress & Achievement Summary',
    generatedAt: 'Generated at',
    overview: 'Learning Overview',
    totalProgress: 'Total Progress',
    completedModules: 'Completed Modules',
    completedTopics: 'Completed Topics',
    completedProjects: 'Completed Projects',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    days: 'days',
    moduleProgress: 'Module Progress Details',
    module: 'Module',
    level: 'Level',
    progress: 'Progress',
    status: 'Status',
    projectProgress: 'Project Completion',
    project: 'Project',
    difficulty: 'Difficulty',
    achievements: 'Achievements Earned',
    achievementName: 'Achievement',
    achievementDesc: 'Description',
    levels: {
      foundation: 'Foundation',
      development: 'Development',
      advanced: 'Advanced',
      expert: 'Expert',
    },
    difficulties: {
      beginner: 'Beginner',
      elementary: 'Elementary',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    },
    statuses: {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed',
    },
    footer: 'Web3 Learning Journey - Systematic Web3 Learning Path',
    noData: 'No data',
  },
};

export async function generateLearningReport(data: ReportData): Promise<void> {
  const { userName, learningProgress, projectProgress, stats, locale } = data;
  const t = translations[locale];

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Calculate statistics
  const totalTopics = learningModules.reduce((sum, m) => sum + m.topics.length, 0);
  const completedTopics = learningProgress.filter((p) => p.status === 'completed').length;
  const completedModulesCount = learningModules.filter((m) => {
    const moduleTopics = learningProgress.filter(
      (p) => p.module_id === m.id && p.status === 'completed'
    );
    return moduleTopics.length === m.topics.length && m.topics.length > 0;
  }).length;
  const completedProjectsCount = projectProgress.filter((p) => p.status === 'completed').length;
  const totalProgressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Calculate module stats
  const moduleStats: ModuleStats[] = learningModules.map((module) => {
    const moduleProgress = learningProgress.filter(
      (p) => p.module_id === module.id && p.status === 'completed'
    );
    return {
      module,
      completedTopics: moduleProgress.length,
      totalTopics: module.topics.length,
      percentage: module.topics.length > 0
        ? Math.round((moduleProgress.length / module.topics.length) * 100)
        : 0,
    };
  });

  // ========== HEADER ==========
  // Gradient-like header background
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, pageWidth / 2, 22, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtitle, pageWidth / 2, 32, { align: 'center' });

  // User name and date
  doc.setFontSize(10);
  doc.text(`${userName} | ${t.generatedAt}: ${new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}`, pageWidth / 2, 42, { align: 'center' });

  yPos = 60;

  // ========== OVERVIEW SECTION ==========
  doc.setTextColor(...colors.dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.overview, margin, yPos);
  yPos += 10;

  // Overview cards (simulated with rectangles)
  const cardWidth = (pageWidth - margin * 2 - 10) / 2;
  const cardHeight = 25;

  // Card 1: Total Progress
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.text(t.totalProgress, margin + 5, yPos + 8);
  doc.setFontSize(18);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalProgressPercent}%`, margin + 5, yPos + 20);

  // Card 2: Completed Topics
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(t.completedTopics, margin + cardWidth + 15, yPos + 8);
  doc.setFontSize(18);
  doc.setTextColor(...colors.secondary);
  doc.setFont('helvetica', 'bold');
  doc.text(`${completedTopics}/${totalTopics}`, margin + cardWidth + 15, yPos + 20);

  yPos += cardHeight + 5;

  // Card 3: Completed Modules
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(t.completedModules, margin + 5, yPos + 8);
  doc.setFontSize(18);
  doc.setTextColor(...colors.success);
  doc.setFont('helvetica', 'bold');
  doc.text(`${completedModulesCount}/${learningModules.length}`, margin + 5, yPos + 20);

  // Card 4: Completed Projects
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(t.completedProjects, margin + cardWidth + 15, yPos + 8);
  doc.setFontSize(18);
  doc.setTextColor(...colors.warning);
  doc.setFont('helvetica', 'bold');
  doc.text(`${completedProjectsCount}/${projects.length}`, margin + cardWidth + 15, yPos + 20);

  yPos += cardHeight + 5;

  // Streak cards
  if (stats) {
    // Card 5: Current Streak
    doc.setFillColor(...colors.light);
    doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(t.currentStreak, margin + 5, yPos + 8);
    doc.setFontSize(18);
    doc.setTextColor(...colors.danger);
    doc.setFont('helvetica', 'bold');
    doc.text(`${stats.current_streak} ${t.days}`, margin + 5, yPos + 20);

    // Card 6: Longest Streak
    doc.setFillColor(...colors.light);
    doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(t.longestStreak, margin + cardWidth + 15, yPos + 8);
    doc.setFontSize(18);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`${stats.longest_streak} ${t.days}`, margin + cardWidth + 15, yPos + 20);

    yPos += cardHeight + 10;
  } else {
    yPos += 10;
  }

  // ========== MODULE PROGRESS TABLE ==========
  checkPageBreak(50);
  doc.setTextColor(...colors.dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.moduleProgress, margin, yPos);
  yPos += 8;

  const moduleTableData = moduleStats.map((ms) => {
    const levelKey = ms.module.level as keyof typeof t.levels;
    const statusKey = ms.percentage === 100 ? 'completed' : ms.percentage > 0 ? 'in_progress' : 'not_started';
    return [
      ms.module.id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      t.levels[levelKey],
      `${ms.completedTopics}/${ms.totalTopics} (${ms.percentage}%)`,
      t.statuses[statusKey as keyof typeof t.statuses],
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [[t.module, t.level, t.progress, t.status]],
    body: moduleTableData,
    theme: 'striped',
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: colors.light,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ========== PROJECT PROGRESS TABLE ==========
  checkPageBreak(50);
  doc.setTextColor(...colors.dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.projectProgress, margin, yPos);
  yPos += 8;

  const projectTableData = projects.map((project) => {
    const progress = projectProgress.find((p) => p.project_id === project.id);
    const status = progress?.status || 'not_started';
    const difficultyKey = project.difficulty as keyof typeof t.difficulties;
    return [
      project.id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      t.difficulties[difficultyKey],
      t.statuses[status as keyof typeof t.statuses],
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [[t.project, t.difficulty, t.status]],
    body: projectTableData,
    theme: 'striped',
    headStyles: {
      fillColor: colors.secondary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: colors.light,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ========== ACHIEVEMENTS SECTION ==========
  if (stats && stats.achievements && stats.achievements.length > 0) {
    checkPageBreak(50);
    doc.setTextColor(...colors.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t.achievements, margin, yPos);
    yPos += 8;

    const achievementTableData = (stats.achievements as AchievementId[])
      .map((achievementId) => {
        const achievement = allAchievements.find((a) => a.id === achievementId);
        if (!achievement) return null;

        // Get translation key parts
        const titleKeyParts = achievement.titleKey.split('.');
        const descKeyParts = achievement.descriptionKey.split('.');
        const titleKey = titleKeyParts[titleKeyParts.length - 1];
        const descKey = descKeyParts[descKeyParts.length - 1];

        // Simplified name display
        return [
          `${achievement.icon} ${titleKey.replace(/([A-Z])/g, ' $1').trim()}`,
          descKey.replace(/([A-Z])/g, ' $1').trim(),
        ];
      })
      .filter(Boolean) as string[][];

    if (achievementTableData.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [[t.achievementName, t.achievementDesc]],
        body: achievementTableData,
        theme: 'striped',
        headStyles: {
          fillColor: colors.success,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: colors.light,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        margin: { left: margin, right: margin },
      });
    }
  }

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text(
      t.footer,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `${i}/${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save PDF
  const fileName = `web3-learning-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
