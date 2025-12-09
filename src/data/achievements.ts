import { Achievement, AchievementId } from '@/lib/supabase/types';

export const achievements: Achievement[] = [
  {
    id: 'first_step',
    titleKey: 'achievements.firstStep.title',
    descriptionKey: 'achievements.firstStep.description',
    icon: '🎯',
    color: 'from-green-400 to-emerald-500',
    condition: 'complete_first_topic',
  },
  {
    id: 'module_master',
    titleKey: 'achievements.moduleMaster.title',
    descriptionKey: 'achievements.moduleMaster.description',
    icon: '📚',
    color: 'from-blue-400 to-indigo-500',
    condition: 'complete_first_module',
  },
  {
    id: 'streak_7',
    titleKey: 'achievements.streak7.title',
    descriptionKey: 'achievements.streak7.description',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    condition: 'streak_7_days',
  },
  {
    id: 'streak_30',
    titleKey: 'achievements.streak30.title',
    descriptionKey: 'achievements.streak30.description',
    icon: '💪',
    color: 'from-purple-400 to-pink-500',
    condition: 'streak_30_days',
  },
  {
    id: 'half_way',
    titleKey: 'achievements.halfWay.title',
    descriptionKey: 'achievements.halfWay.description',
    icon: '🌟',
    color: 'from-yellow-400 to-orange-500',
    condition: 'complete_50_percent',
  },
  {
    id: 'full_stack',
    titleKey: 'achievements.fullStack.title',
    descriptionKey: 'achievements.fullStack.description',
    icon: '🚀',
    color: 'from-cyan-400 to-blue-500',
    condition: 'complete_first_project',
  },
  {
    id: 'security_expert',
    titleKey: 'achievements.securityExpert.title',
    descriptionKey: 'achievements.securityExpert.description',
    icon: '🛡️',
    color: 'from-red-400 to-rose-500',
    condition: 'complete_security_module',
  },
  {
    id: 'defi_explorer',
    titleKey: 'achievements.defiExplorer.title',
    descriptionKey: 'achievements.defiExplorer.description',
    icon: '💰',
    color: 'from-emerald-400 to-teal-500',
    condition: 'complete_defi_module',
  },
  {
    id: 'nft_creator',
    titleKey: 'achievements.nftCreator.title',
    descriptionKey: 'achievements.nftCreator.description',
    icon: '🎨',
    color: 'from-pink-400 to-purple-500',
    condition: 'complete_nft_module',
  },
  {
    id: 'zk_pioneer',
    titleKey: 'achievements.zkPioneer.title',
    descriptionKey: 'achievements.zkPioneer.description',
    icon: '🔐',
    color: 'from-indigo-400 to-violet-500',
    condition: 'complete_zk_module',
  },
  {
    id: 'completionist',
    titleKey: 'achievements.completionist.title',
    descriptionKey: 'achievements.completionist.description',
    icon: '👑',
    color: 'from-amber-400 to-yellow-500',
    condition: 'complete_all_topics',
  },
];

export function getAchievementById(id: AchievementId): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

export function getUnlockedAchievements(achievementIds: string[]): Achievement[] {
  return achievements.filter((a) => achievementIds.includes(a.id));
}

export function getLockedAchievements(achievementIds: string[]): Achievement[] {
  return achievements.filter((a) => !achievementIds.includes(a.id));
}
