'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useProgress } from './useProgress';
import type { UserStats, AchievementId } from '@/lib/supabase/types';
import { learningModules as modules, type LearningModule } from '@/data/content';

interface UseStatsReturn {
  stats: UserStats | null;
  currentStreak: number;
  longestStreak: number;
  totalLearningMinutes: number;
  achievements: AchievementId[];
  loading: boolean;
  updateStreak: () => Promise<void>;
  checkAndUnlockAchievements: () => Promise<AchievementId[]>;
}

const DEFAULT_STATS: Omit<UserStats, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
  total_learning_minutes: 0,
  achievements: [],
};

export function useStats(): UseStatsReturn {
  const { user } = useAuthContext();
  const { learningProgress, projectProgress, getTotalCompletedTopics } = useProgress();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No stats found, create initial stats
          const { data: newStats, error: insertError } = await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              ...DEFAULT_STATS,
            } as unknown as Record<string, unknown>)
            .select()
            .single();

          if (!insertError && newStats) {
            setStats(newStats as unknown as UserStats);
          }
        } else {
          console.error('Error fetching stats:', error);
        }
      } else {
        setStats(data as unknown as UserStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Calculate if today is a new day from last activity
  const isNewDay = useCallback((lastDate: string | null): boolean => {
    if (!lastDate) return true;
    const last = new Date(lastDate);
    const today = new Date();
    return (
      last.getFullYear() !== today.getFullYear() ||
      last.getMonth() !== today.getMonth() ||
      last.getDate() !== today.getDate()
    );
  }, []);

  // Check if streak should continue or reset
  const shouldContinueStreak = useCallback((lastDate: string | null): boolean => {
    if (!lastDate) return false;
    const last = new Date(lastDate);
    const today = new Date();
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }, []);

  // Update streak when user completes learning activity
  const updateStreak = useCallback(async () => {
    if (!user || !stats) return;

    const today = new Date().toISOString().split('T')[0];

    // Only update if it's a new day
    if (!isNewDay(stats.last_activity_date)) return;

    let newStreak = 1;
    if (shouldContinueStreak(stats.last_activity_date)) {
      newStreak = stats.current_streak + 1;
    }

    const newLongestStreak = Math.max(newStreak, stats.longest_streak);

    try {
      const { error } = await supabase
        .from('user_stats')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        } as unknown as Record<string, unknown>)
        .eq('user_id', user.id);

      if (!error) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                current_streak: newStreak,
                longest_streak: newLongestStreak,
                last_activity_date: today,
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, stats, supabase, isNewDay, shouldContinueStreak]);

  // Check and unlock achievements
  const checkAndUnlockAchievements = useCallback(async (): Promise<AchievementId[]> => {
    if (!user || !stats) return [];

    const currentAchievements = stats.achievements as AchievementId[];
    const newAchievements: AchievementId[] = [];
    const completedTopics = getTotalCompletedTopics();

    // Calculate total topics
    const totalTopics = modules.reduce((sum: number, m: LearningModule) => sum + m.topics.length, 0);
    const completedModules = modules.filter((m: LearningModule) => {
      const moduleTopics = learningProgress.filter(
        (p) => p.module_id === m.id && p.status === 'completed'
      );
      return moduleTopics.length === m.topics.length && m.topics.length > 0;
    });
    const completedProjects = projectProgress.filter((p) => p.status === 'completed');

    // Check each achievement condition
    const checkAchievement = (id: AchievementId, condition: boolean) => {
      if (!currentAchievements.includes(id) && condition) {
        newAchievements.push(id);
      }
    };

    // First step - complete first topic
    checkAchievement('first_step', completedTopics >= 1);

    // Module master - complete first module
    checkAchievement('module_master', completedModules.length >= 1);

    // Streak achievements
    checkAchievement('streak_7', stats.current_streak >= 7);
    checkAchievement('streak_30', stats.current_streak >= 30);

    // Half way - complete 50% of topics
    checkAchievement('half_way', completedTopics >= totalTopics / 2);

    // Full stack - complete first project
    checkAchievement('full_stack', completedProjects.length >= 1);

    // Module-specific achievements
    const isModuleCompleted = (moduleId: string) => {
      const module = modules.find((m: LearningModule) => m.id === moduleId);
      if (!module) return false;
      const moduleProgress = learningProgress.filter(
        (p) => p.module_id === moduleId && p.status === 'completed'
      );
      return moduleProgress.length === module.topics.length;
    };

    checkAchievement('security_expert', isModuleCompleted('contract-security'));
    checkAchievement('defi_explorer', isModuleCompleted('defi-development'));
    checkAchievement('nft_creator', isModuleCompleted('nft-development'));
    checkAchievement('zk_pioneer', isModuleCompleted('zk-applications'));

    // Completionist - complete all topics
    checkAchievement('completionist', completedTopics >= totalTopics);

    // Save new achievements
    if (newAchievements.length > 0) {
      const allAchievements = [...currentAchievements, ...newAchievements];
      try {
        const { error } = await supabase
          .from('user_stats')
          .update({
            achievements: allAchievements,
            updated_at: new Date().toISOString(),
          } as unknown as Record<string, unknown>)
          .eq('user_id', user.id);

        if (!error) {
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  achievements: allAchievements,
                }
              : null
          );
        }
      } catch (error) {
        console.error('Error saving achievements:', error);
      }
    }

    return newAchievements;
  }, [user, stats, supabase, learningProgress, projectProgress, getTotalCompletedTopics]);

  return {
    stats,
    currentStreak: stats?.current_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    totalLearningMinutes: stats?.total_learning_minutes || 0,
    achievements: (stats?.achievements || []) as AchievementId[],
    loading,
    updateStreak,
    checkAndUnlockAchievements,
  };
}
