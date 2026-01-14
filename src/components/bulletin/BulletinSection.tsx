'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';

export function BulletinSection() {
  const [editOpen, setEditOpen] = useState(false);
  const [content, setContent] = useState('');

  const bulletin = useAppStore((state) => state.bulletin);
  const updateBulletin = useAppStore((state) => state.updateBulletin);

  const handleSave = () => {
    updateBulletin(content);
    setEditOpen(false);
  };

  const handleEditOpen = () => {
    setContent(bulletin.content);
    setEditOpen(true);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">公告栏</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleEditOpen}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl leading-relaxed whitespace-pre-wrap lg:text-3xl">
            {bulletin.content || '暂无公告内容'}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑公告</DialogTitle>
          </DialogHeader>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入公告内容..."
            rows={10}
            className="text-lg"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
