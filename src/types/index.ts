// 快捷积分项配置
export interface QuickPointItem {
  id: string;
  name: string; // 项目名称，如"完成作业"
  points: number; // 分数，始终存储为正数
  operationType?: 'add' | 'deduct'; // 操作类型，可选，用于向后兼容，默认为 'add'
}

// 家庭成员
export interface Member {
  id: string;
  name: string;
  quickItems: QuickPointItem[]; // 该成员的快捷积分项
  totalPoints: number; // 当前总积分
}

// 操作类型
export type OperationType = 'add' | 'deduct' | 'undo';

// 积分操作日志
export interface PointLog {
  id: string;
  memberId: string; // 关联的成员ID
  memberName: string; // 冗余存储成员名称
  operationType: OperationType;
  itemName: string; // 项目名称
  points: number; // 积分变化（正数或负数）
  timestamp: number; // 时间戳
  isUndone: boolean; // 是否已撤销
  undoLogId?: string; // 关联的撤销日志ID
  relatedLogId?: string; // 关联的原始日志ID（撤销操作时使用）
}

// 应用全局状态
export interface AppState {
  members: Member[];
  logs: PointLog[];

  // 成员操作
  addMember: (name: string) => void;
  updateMember: (id: string, name: string) => void;
  deleteMember: (id: string) => void;

  // 积分操作
  addPoints: (memberId: string, itemName: string, points: number) => void;
  deductPoints: (memberId: string, itemName: string, points: number) => void;

  // 快捷积分项操作
  addQuickItem: (memberId: string, name: string, points: number, operationType?: 'add' | 'deduct') => void;
  updateQuickItem: (memberId: string, itemId: string, name: string, points: number, operationType?: 'add' | 'deduct') => void;
  deleteQuickItem: (memberId: string, itemId: string) => void;

  // 日志操作
  undoLog: (logId: string) => void;
  canUndoLog: (logId: string) => boolean;
}
