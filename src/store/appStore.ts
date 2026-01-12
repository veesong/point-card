import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Member, PointLog } from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: [],
      logs: [],

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
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }));
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
      addQuickItem: (memberId: string, name: string, points: number) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: [
                    ...member.quickItems,
                    { id: crypto.randomUUID(), name, points },
                  ],
                }
              : member
          ),
        }));
      },

      updateQuickItem: (memberId: string, itemId: string, name: string, points: number) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  quickItems: member.quickItems.map((item) =>
                    item.id === itemId ? { ...item, name, points } : item
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
    }),
    {
      name: 'family-points-storage',
      version: 1,
    }
  )
);
