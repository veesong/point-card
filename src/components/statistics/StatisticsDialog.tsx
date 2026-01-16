'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { filterCurrentWeekLogs, transformToAddPieChartData, transformToDeductPieChartData, transformToAddPieChartDataByCount, transformToDeductPieChartDataByCount, transformToBarChartData } from '@/lib/statistics';
import { PieChartSection } from './PieChartSection';
import { BarChartSection } from './BarChartSection';
import type { Member } from '@/types';

interface StatisticsDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatisticsDialog({ member, open, onOpenChange }: StatisticsDialogProps) {
  const allLogs = useAppStore((state) => state.logs);

  // 使用 useMemo 进行数据转换
  const filteredLogs = useMemo(
    () => filterCurrentWeekLogs(allLogs, member?.id || ''),
    [allLogs, member?.id]
  );

  const addPieChartData = useMemo(
    () => transformToAddPieChartData(filteredLogs),
    [filteredLogs]
  );

  const deductPieChartData = useMemo(
    () => transformToDeductPieChartData(filteredLogs),
    [filteredLogs]
  );

  const addPieChartByCountData = useMemo(
    () => transformToAddPieChartDataByCount(filteredLogs),
    [filteredLogs]
  );

  const deductPieChartByCountData = useMemo(
    () => transformToDeductPieChartDataByCount(filteredLogs),
    [filteredLogs]
  );

  const barChartData = useMemo(
    () => transformToBarChartData(filteredLogs),
    [filteredLogs]
  );

  const { start, end } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday.getTime(), end: sunday.getTime() };
  }, []);

  const weekRangeText = `${formatDateTime(start)} - ${formatDateTime(end)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            <DialogTitle>{member?.name} 的本周统计</DialogTitle>
          </div>
          <DialogDescription>{weekRangeText}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">项目统计</TabsTrigger>
            <TabsTrigger value="bar">每日统计</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-4">
            <PieChartSection
              addScoreData={addPieChartData}
              addCountData={addPieChartByCountData}
              deductScoreData={deductPieChartData}
              deductCountData={deductPieChartByCountData}
            />
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            <BarChartSection data={barChartData} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
