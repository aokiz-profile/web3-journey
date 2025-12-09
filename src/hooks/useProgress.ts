'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import type { LearningProgress, ProjectProgress, ProgressStatus } from '@/lib/supabase/types';

interface UseProgressReturn {
  // Learning progress
  learningProgress: LearningProgress[];
  updateLearningProgress: (
    moduleId: string,
    topicId: string,
    status: ProgressStatus,
    notes?: string
  ) => Promise<void>;
  getLearningStatus: (moduleId: string, topicId: string) => ProgressStatus;
  getModuleProgress: (moduleId: string) => number;

  // Project progress
  projectProgress: ProjectProgress[];
  updateProjectProgress: (
    projectId: string,
    status: ProgressStatus,
    data?: { githubUrl?: string; demoUrl?: string; notes?: string }
  ) => Promise<void>;
  getProjectStatus: (projectId: string) => ProgressStatus;

  // Stats
  getTotalCompletedTopics: () => number;
  getTotalProgress: () => number;

  // State
  loading: boolean;
  syncing: boolean;
}

export function useProgress(): UseProgressReturn {
  const { user } = useAuthContext();
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const supabase = createClient();

  // Fetch all progress data
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLearningProgress([]);
      setProjectProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [learningRes, projectRes] = await Promise.all([
        supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('project_progress')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (learningRes.data) {
        setLearningProgress(learningRes.data as unknown as LearningProgress[]);
      }
      if (projectRes.data) {
        setProjectProgress(projectRes.data as unknown as ProjectProgress[]);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    fetchProgress();

    // Subscribe to learning progress changes
    const learningChannel = supabase
      .channel('learning_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    // Subscribe to project progress changes
    const projectChannel = supabase
      .channel('project_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(learningChannel);
      supabase.removeChannel(projectChannel);
    };
  }, [user, supabase, fetchProgress]);

  // Update learning progress
  const updateLearningProgress = useCallback(
    async (
      moduleId: string,
      topicId: string,
      status: ProgressStatus,
      notes?: string
    ) => {
      if (!user) return;

      setSyncing(true);
      try {
        const { error } = await supabase.from('learning_progress').upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            topic_id: topicId,
            status,
            notes: notes || null,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          } as unknown as Record<string, unknown>,
          {
            onConflict: 'user_id,module_id,topic_id',
          }
        );

        if (error) throw error;

        // Optimistic update
        setLearningProgress((prev) => {
          const existing = prev.find(
            (p) => p.module_id === moduleId && p.topic_id === topicId
          );
          if (existing) {
            return prev.map((p) =>
              p.module_id === moduleId && p.topic_id === topicId
                ? { ...p, status, notes: notes || p.notes }
                : p
            );
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: user.id,
              module_id: moduleId,
              topic_id: topicId,
              status,
              notes: notes || null,
              completed_at: status === 'completed' ? new Date().toISOString() : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        });
      } catch (error) {
        console.error('Error updating learning progress:', error);
      } finally {
        setSyncing(false);
      }
    },
    [user, supabase]
  );

  // Update project progress
  const updateProjectProgress = useCallback(
    async (
      projectId: string,
      status: ProgressStatus,
      data?: { githubUrl?: string; demoUrl?: string; notes?: string }
    ) => {
      if (!user) return;

      setSyncing(true);
      try {
        const { error } = await supabase.from('project_progress').upsert(
          {
            user_id: user.id,
            project_id: projectId,
            status,
            github_url: data?.githubUrl || null,
            demo_url: data?.demoUrl || null,
            notes: data?.notes || null,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          } as unknown as Record<string, unknown>,
          {
            onConflict: 'user_id,project_id',
          }
        );

        if (error) throw error;

        // Optimistic update
        setProjectProgress((prev) => {
          const existing = prev.find((p) => p.project_id === projectId);
          if (existing) {
            return prev.map((p) =>
              p.project_id === projectId
                ? {
                    ...p,
                    status,
                    github_url: data?.githubUrl || p.github_url,
                    demo_url: data?.demoUrl || p.demo_url,
                    notes: data?.notes || p.notes,
                  }
                : p
            );
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: user.id,
              project_id: projectId,
              status,
              github_url: data?.githubUrl || null,
              demo_url: data?.demoUrl || null,
              notes: data?.notes || null,
              completed_at: status === 'completed' ? new Date().toISOString() : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        });
      } catch (error) {
        console.error('Error updating project progress:', error);
      } finally {
        setSyncing(false);
      }
    },
    [user, supabase]
  );

  // Get learning status for a specific topic
  const getLearningStatus = useCallback(
    (moduleId: string, topicId: string): ProgressStatus => {
      const progress = learningProgress.find(
        (p) => p.module_id === moduleId && p.topic_id === topicId
      );
      return progress?.status || 'not_started';
    },
    [learningProgress]
  );

  // Get module progress percentage
  const getModuleProgress = useCallback(
    (moduleId: string): number => {
      const moduleItems = learningProgress.filter((p) => p.module_id === moduleId);
      if (moduleItems.length === 0) return 0;
      const completed = moduleItems.filter((p) => p.status === 'completed').length;
      return Math.round((completed / moduleItems.length) * 100);
    },
    [learningProgress]
  );

  // Get project status
  const getProjectStatus = useCallback(
    (projectId: string): ProgressStatus => {
      const progress = projectProgress.find((p) => p.project_id === projectId);
      return progress?.status || 'not_started';
    },
    [projectProgress]
  );

  // Get total completed topics
  const getTotalCompletedTopics = useCallback(() => {
    return learningProgress.filter((p) => p.status === 'completed').length;
  }, [learningProgress]);

  // Get total progress
  const getTotalProgress = useCallback(() => {
    if (learningProgress.length === 0) return 0;
    const completed = learningProgress.filter((p) => p.status === 'completed').length;
    return Math.round((completed / learningProgress.length) * 100);
  }, [learningProgress]);

  return {
    learningProgress,
    updateLearningProgress,
    getLearningStatus,
    getModuleProgress,
    projectProgress,
    updateProjectProgress,
    getProjectStatus,
    getTotalCompletedTopics,
    getTotalProgress,
    loading,
    syncing,
  };
}
