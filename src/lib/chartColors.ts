// 图表颜色配置

// 20 个预设的好看颜色（不包含黑色和白色）
export const PRESET_COLORS = [
  'hsl(221, 83%, 53%)',       // 0: 蓝色 (chart-1 的实际值)
  'hsl(142, 76%, 36%)',       // 1: 深绿色
  'hsl(280, 65%, 40%)',       // 2: 紫色
  'hsl(25, 95%, 53%)',        // 3: 橙色
  'hsl(340, 82%, 52%)',       // 4: 粉色
  'hsl(45, 93%, 47%)',        // 5: 金黄色
  'hsl(190, 90%, 40%)',       // 6: 青色
  'hsl(0, 84%, 60%)',         // 7: 红色 (destructive 的实际值)
  'hsl(170, 75%, 45%)',       // 8: 蓝绿色
  'hsl(265, 70%, 50%)',       // 9: 靛蓝色
  'hsl(220, 80%, 45%)',       // 10: 皇家蓝
  'hsl(120, 60%, 45%)',       // 11: 翠绿色
  'hsl(60, 90%, 50%)',        // 12: 琥珀色
  'hsl(300, 70%, 50%)',       // 13: 洋红色
  'hsl(10, 80%, 55%)',        // 14: 朱红色
  'hsl(200, 85%, 50%)',       // 15: 天蓝色
  'hsl(80, 75%, 45%)',        // 16: 橄榄绿
  'hsl(320, 75%, 55%)',       // 17: 玫瑰色
  'hsl(150, 70%, 40%)',       // 18: 祖母绿
  'hsl(35, 90%, 55%)',        // 19: 珊瑚色
];

// 柱状图专用颜色
export const BAR_CHART_COLORS = {
  add: PRESET_COLORS[0],      // 加分：蓝色
  deduct: PRESET_COLORS[1],   // 扣分：深绿色
} as const;

// 获取颜色函数（用于饼图）
export function getColor(index: number): string {
  if (index < PRESET_COLORS.length) {
    return PRESET_COLORS[index];
  }
  // 生成随机颜色（避免黑色和白色）
  const hue = (index * 137.508) % 360; // 使用黄金角度分布，确保颜色分散
  const saturation = 60 + (index % 30); // 60-90% 饱和度
  const lightness = 40 + (index % 30);  // 40-70% 亮度，避免太黑或太白
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
