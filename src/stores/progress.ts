import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LearningStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';

interface ModuleProgress {
  id: string;
  status: LearningStatus;
  completedTopics: string[];
  lastAccessedAt?: string;
  completedAt?: string;
}

interface ProjectProgress {
  id: string;
  status: ProjectStatus;
  startedAt?: string;
  completedAt?: string;
}

interface LearningRecord {
  date: string;
  moduleId: string;
  duration: number; // minutes
}

interface ProgressState {
  // Module progress
  moduleProgress: Record<string, ModuleProgress>;

  // Project progress
  projectProgress: Record<string, ProjectProgress>;

  // Learning records
  learningRecords: LearningRecord[];

  // Stats
  totalLearningMinutes: number;
  currentStreak: number;
  lastLearningDate?: string;

  // Skills (0-100)
  skills: {
    blockchain: number;
    solidity: number;
    frontend: number;
    security: number;
    defi: number;
    nft: number;
  };

  // Achievements
  achievements: string[];

  // Actions
  updateModuleStatus: (moduleId: string, status: LearningStatus) => void;
  completeModuleTopic: (moduleId: string, topicId: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  addLearningRecord: (moduleId: string, duration: number) => void;
  updateSkill: (skill: keyof ProgressState['skills'], value: number) => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
}

const initialSkills = {
  blockchain: 0,
  solidity: 0,
  frontend: 0,
  security: 0,
  defi: 0,
  nft: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      moduleProgress: {},
      projectProgress: {},
      learningRecords: [],
      totalLearningMinutes: 0,
      currentStreak: 0,
      skills: initialSkills,
      achievements: [],

      updateModuleStatus: (moduleId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          moduleProgress: {
            ...state.moduleProgress,
            [moduleId]: {
              ...state.moduleProgress[moduleId],
              id: moduleId,
              status,
              lastAccessedAt: now,
              completedAt: status === 'completed' || status === 'mastered' ? now : state.moduleProgress[moduleId]?.completedAt,
              completedTopics: state.moduleProgress[moduleId]?.completedTopics || [],
            },
          },
        }));

        // Check achievements
        const currentState = get();
        const completedModules = Object.values(currentState.moduleProgress).filter(
          (m) => m.status === 'completed' || m.status === 'mastered'
        ).length;

        if (completedModules >= 1 && !currentState.achievements.includes('first_step')) {
          get().unlockAchievement('first_step');
        }
      },

      completeModuleTopic: (moduleId, topicId) => {
        set((state) => {
          const currentModule = state.moduleProgress[moduleId] || {
            id: moduleId,
            status: 'in_progress' as LearningStatus,
            completedTopics: [],
          };

          const completedTopics = currentModule.completedTopics.includes(topicId)
            ? currentModule.completedTopics
            : [...currentModule.completedTopics, topicId];

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentModule,
                completedTopics,
                lastAccessedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateProjectStatus: (projectId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          projectProgress: {
            ...state.projectProgress,
            [projectId]: {
              id: projectId,
              status,
              startedAt: status === 'in_progress' ? now : state.projectProgress[projectId]?.startedAt,
              completedAt: status === 'completed' ? now : undefined,
            },
          },
        }));

        // Check full stack achievement
        const currentState = get();
        const completedProjects = Object.values(currentState.projectProgress).filter(
          (p) => p.status === 'completed'
        ).length;

        if (completedProjects >= 1 && !currentState.achievements.includes('full_stack')) {
          get().unlockAchievement('full_stack');
        }
      },

      addLearningRecord: (moduleId, duration) => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastLearningDate;

        set((state) => {
          // Calculate streak
          let newStreak = state.currentStreak;
          if (lastDate) {
            const lastDateObj = new Date(lastDate);
            const todayObj = new Date(today);
            const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak = state.currentStreak + 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          return {
            learningRecords: [
              ...state.learningRecords,
              { date: today, moduleId, duration },
            ],
            totalLearningMinutes: state.totalLearningMinutes + duration,
            currentStreak: newStreak,
            lastLearningDate: today,
          };
        });
      },

      updateSkill: (skill, value) => {
        set((state) => ({
          skills: {
            ...state.skills,
            [skill]: Math.min(100, Math.max(0, value)),
          },
        }));
      },

      unlockAchievement: (achievementId) => {
        set((state) => ({
          achievements: state.achievements.includes(achievementId)
            ? state.achievements
            : [...state.achievements, achievementId],
        }));
      },

      resetProgress: () => {
        set({
          moduleProgress: {},
          projectProgress: {},
          learningRecords: [],
          totalLearningMinutes: 0,
          currentStreak: 0,
          lastLearningDate: undefined,
          skills: initialSkills,
          achievements: [],
        });
      },
    }),
    {
      name: 'web3-journey-progress',
    }
  )
);

// Helper functions
export const getOverallProgress = (moduleProgress: Record<string, ModuleProgress>, totalModules: number) => {
  const completed = Object.values(moduleProgress).filter(
    (m) => m.status === 'completed' || m.status === 'mastered'
  ).length;
  return totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0;
};

export const formatLearningTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
