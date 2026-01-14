import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, TemplateState, Member, PointLog, TemplateCategory, TemplateItem } from '@/types';

// 默认模板数据
const defaultTemplates = [
  // 加分项
  { id: 't1', categoryId: 'default-1', name: '跳绳 100 个', points: 1, operationType: 'add' as const },
  { id: 't2', categoryId: 'default-1', name: '摸高 50 个', points: 1, operationType: 'add' as const },
  { id: 't3', categoryId: 'default-1', name: '户外活动 1 小时', points: 2, operationType: 'add' as const },
  { id: 't4', categoryId: 'default-1', name: '九点半前睡觉', points: 2, operationType: 'add' as const },
  { id: 't5', categoryId: 'default-1', name: '20分钟内吃完饭', points: 2, operationType: 'add' as const },
  { id: 't6', categoryId: 'default-1', name: '期末考试获奖', points: 50, operationType: 'add' as const },
  { id: 't7', categoryId: 'default-1', name: '考试成绩优秀', points: 20, operationType: 'add' as const },
  { id: 't8', categoryId: 'default-1', name: '学校特殊表彰', points: 20, operationType: 'add' as const },
  { id: 't9', categoryId: 'default-1', name: '作业出色受到表扬', points: 5, operationType: 'add' as const },
  // 扣分项
  { id: 't10', categoryId: 'default-2', name: '玩手机平板10分钟', points: 2, operationType: 'deduct' as const },
  { id: 't11', categoryId: 'default-2', name: '看电视15分钟', points: 2, operationType: 'deduct' as const },
  { id: 't12', categoryId: 'default-2', name: '电脑游戏 30 分钟', points: 10, operationType: 'deduct' as const },
  { id: 't13', categoryId: 'default-2', name: '提现 5 元', points: 5, operationType: 'deduct' as const },
  { id: 't14', categoryId: 'default-2', name: '十点半之后睡', points: 2, operationType: 'deduct' as const },
  { id: 't15', categoryId: 'default-2', name: '不认真吃饭', points: 1, operationType: 'deduct' as const },
  { id: 't16', categoryId: 'default-2', name: '在学校受到严厉批评', points: 10, operationType: 'deduct' as const },
  { id: 't17', categoryId: 'default-2', name: '起床拖拉上学迟到', points: 2, operationType: 'deduct' as const },
  { id: 't18', categoryId: 'default-2', name: '让妈妈生气', points: 5, operationType: 'deduct' as const }
];

const defaultCategories = [
  { id: 'default-1', name: '加分项', sortOrder: 0 },
  { id: 'default-2', name: '扣分项', sortOrder: 1 }
];

const defaultBulletin = {
  content: '欢迎使用家庭积分管理系统！\n在这里可以记录家庭成员的积分变化。',
  lastUpdated: Date.now()
};

export const useAppStore = create<AppState & TemplateState>()(
  persist(
    (set, get) => ({
      members: [],
      logs: [],

      // 模板和公告初始状态（空状态，由 merge 函数智能初始化）
      categories: [],
      templates: [],
      bulletin: { content: '', lastUpdated: 0 },

      // 成员操作
      addMember: (name: string) => {
        const newMember: Member = {
          id: crypto.randomUUID(),
          name,
          quickItems: [],
          totalPoints: 0,
        };
        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      updateMember: (id: string, name: string) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, name } : member
          ),
        }));
      },

      deleteMember: (id: string) => {
        set((state) => {
          // 过滤掉要删除的成员
          const updatedMembers = state.members.filter((member) => member.id !== id);

          // 过滤掉该成员的所有日志
          const updatedLogs = state.logs.filter((log) => log.memberId !== id);

          return {
            members: updatedMembers,
            logs: updatedLogs,
          };
        });
      },

      // 积分操作
      addPoints: (memberId: string, itemName: string, points: number) => {
        set((state) => {
          const member = state.members.find((m) => m.id === memberId);
          if (!member) return state;

          const newLog: PointLog = {
            id: crypto.randomUUID(),
            memberId,
            memberName: member.name,
            operationType: 'add',
            itemName,
            points,
            timestamp: Date.now(),
            isUndone: false,
          };

          return {
            members: state.members.map((m) =>
              m.id === memberId ? { ...m, totalPoints: m.totalPoints + points } : m
            ),
            logs: [newLog, ...state.logs],
          };
        });
      },

      deductPoints: (memberId: string, itemName: string, points: number) => {
        set((state) => {
          const member = state.members.find((m) => m.id === memberId);
          if (!member) return state;

          const newLog: PointLog = {
            id: crypto.randomUUID(),
            memberId,
            memberName: member.name,
            operationType: 'deduct',
            itemName,
            points: -points,
            timestamp: Date.now(),
            isUndone: false,
          };

          return {
            members: state.members.map((m) =>
              m.id === memberId ? { ...m, totalPoints: m.totalPoints - points } : m
            ),
            logs: [newLog, ...state.logs],
          };
        });
      },

      // 快捷积分项操作
      addQuickItem: (memberId: string, name: string, points: number, operationType: 'add' | 'deduct' = 'add') => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: [
                    ...member.quickItems,
                    { id: crypto.randomUUID(), name, points, operationType },
                  ],
                }
              : member
          ),
        }));
      },

      updateQuickItem: (memberId: string, itemId: string, name: string, points: number, operationType: 'add' | 'deduct' = 'add') => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: member.quickItems.map((item) =>
                    item.id === itemId ? { ...item, name, points, operationType } : item
                  ),
                }
              : member
          ),
        }));
      },

      deleteQuickItem: (memberId: string, itemId: string) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: member.quickItems.filter((item) => item.id !== itemId),
                }
              : member
          ),
        }));
      },

      // 日志操作
      undoLog: (logId: string) => {
        const state = get();
        const originalLog = state.logs.find((l) => l.id === logId);

        if (!originalLog || originalLog.isUndone || originalLog.operationType === 'undo') {
          return;
        }

        // 标记原日志为已撤销
        // 创建新的撤销日志
        // 反向调整成员积分
        const undoLog: PointLog = {
          id: crypto.randomUUID(),
          memberId: originalLog.memberId,
          memberName: originalLog.memberName,
          operationType: 'undo',
          itemName: `撤销: ${originalLog.itemName}`,
          points: -originalLog.points,
          timestamp: Date.now(),
          isUndone: false,
          relatedLogId: originalLog.id,
        };

        set((state) => {
          const updatedMembers = state.members.map((m) =>
            m.id === originalLog.memberId
              ? { ...m, totalPoints: m.totalPoints - originalLog.points }
              : m
          );

          const updatedLogs = state.logs.map((l) =>
            l.id === logId ? { ...l, isUndone: true, undoLogId: undoLog.id } : l
          );

          return {
            members: updatedMembers,
            logs: [undoLog, ...updatedLogs],
          };
        });
      },

      canUndoLog: (logId: string) => {
        const state = get();
        const log = state.logs.find((l) => l.id === logId);
        if (!log) return false;
        // 只能撤销原始操作，不能撤销已撤销的日志，不能撤销撤销操作
        return !log.isUndone && log.operationType !== 'undo';
      },

      // 分类操作
      addCategory: (name: string) => {
        const newCategory: TemplateCategory = {
          id: crypto.randomUUID(),
          name,
          sortOrder: get().categories.length
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      updateCategory: (id: string, name: string) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, name } : cat
          )
        }));
      },

      deleteCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          templates: state.templates.filter((tmpl) => tmpl.categoryId !== id)
        }));
      },

      // 模板操作
      addTemplate: (categoryId: string, name: string, points: number, operationType: 'add' | 'deduct') => {
        const newTemplate: TemplateItem = {
          id: crypto.randomUUID(),
          categoryId,
          name,
          points,
          operationType
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id: string, name: string, points: number, operationType: 'add' | 'deduct') => {
        set((state) => ({
          templates: state.templates.map((tmpl) =>
            tmpl.id === id ? { ...tmpl, name, points, operationType } : tmpl
          )
        }));
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter((tmpl) => tmpl.id !== id)
        }));
      },

      // 批量导入操作
      importTemplatesToMember: (memberId: string, templateIds: string[]) => {
        const state = get();
        const templatesToImport = state.templates.filter((tmpl) =>
          templateIds.includes(tmpl.id)
        );

        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: [
                    ...member.quickItems,
                    ...templatesToImport.map((tmpl) => ({
                      id: crypto.randomUUID(),
                      name: tmpl.name,
                      points: tmpl.points,
                      operationType: tmpl.operationType
                    }))
                  ]
                }
              : member
          )
        }));
      },

      // 公告操作
      updateBulletin: (content: string) => {
        set((state) => ({
          bulletin: {
            ...state.bulletin,
            content,
            lastUpdated: Date.now()
          }
        }));
      }
    }),
    {
      name: 'family-points-storage',
      version: 4,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 2) {
          // 从版本 2 迁移到版本 4
          const state = persistedState as AppState;
          return {
            ...state,
            categories: defaultCategories,
            templates: defaultTemplates,
            bulletin: defaultBulletin
          };
        }

        return persistedState;
      },
      merge: (persistedState: unknown, currentState: AppState & TemplateState) => {
        const persisted = persistedState as Partial<AppState & TemplateState>;

        // 如果持久化状态中有分类数据，使用用户数据
        if (persisted.categories && persisted.categories.length > 0) {
          return {
            ...currentState,
            ...persisted
          };
        }

        // 没有持久化数据，初始化默认模板
        return {
          ...currentState,
          ...persisted,
          categories: defaultCategories,
          templates: defaultTemplates,
          bulletin: defaultBulletin
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      }
    }
  )
);
