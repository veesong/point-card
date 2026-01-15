import { MemberList } from '@/components/member/MemberList';
import { TemplateSection } from '@/components/template/TemplateSection';
import { BulletinSection } from '@/components/bulletin/BulletinSection';
import { BackupButton } from '@/components/backup/BackupButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2">家庭积分管理系统</h1>
              <p className="text-muted-foreground">记录家庭成员的积分变化</p>
            </div>
            <div className="flex gap-2">
              <BackupButton />
            </div>
          </div>
        </header>

        <main className="space-y-12">
          <section>
            <MemberList />
          </section>

          <section>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <TemplateSection />
              </div>
              <div className="lg:col-span-1">
                <BulletinSection />
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>数据存储在本地浏览器中</p>
        </footer>
      </div>
    </div>
  );
}
