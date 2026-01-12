import { MemberList } from '@/components/member/MemberList';
import { LogList } from '@/components/log/LogList';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">家庭积分管理系统</h1>
          <p className="text-muted-foreground">记录家庭成员的积分变化</p>
        </header>

        <main className="space-y-12">
          <section>
            <MemberList />
          </section>

          <section>
            <LogList />
          </section>
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>数据存储在本地浏览器中</p>
        </footer>
      </div>
    </div>
  );
}
