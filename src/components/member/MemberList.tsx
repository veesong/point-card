'use client';

import { useAppStore } from '@/store/appStore';
import { MemberCard } from './MemberCard';
import { AddMemberDialog } from './AddMemberDialog';

export function MemberList() {
  const members = useAppStore((state) => state.members);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">家庭积分榜</h2>
        <AddMemberDialog />
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">还没有家庭成员</p>
          <p className="text-sm">点击右上角的&ldquo;添加成员&rdquo;按钮开始使用</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 member-grid-3-cols gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
