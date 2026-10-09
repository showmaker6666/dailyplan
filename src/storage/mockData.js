// mock 数据（Day 8）：6 条假任务，供演示模式（?demo=mock）注入主视图
// 字段对齐 PRD 第五章 + TECH_DESIGN 3.1（id / created_at 是实现层补充字段）
// 规矩：本文件只提供数据，注入动作走 localStore（storage 层是唯一数据出口）
import { todayStr } from './localStore'

const T = todayStr() // 假任务也归到"今天"，保证出现在今日页

export const MOCK_TASKS = [
  {
    id: 'mock-1',
    title: '复习高数第 3 章',
    category: '学习',
    priority: '高',
    estimated_min: 90,
    start_time: '14:00',
    status: '未完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:01.000Z', // created_at 决定同优先级的先后顺序
  },
  {
    id: 'mock-2',
    title: '背单词 30 个',
    category: '学习',
    priority: '中',
    estimated_min: 30,
    start_time: '10:00',
    status: '未完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:02.000Z',
  },
  {
    id: 'mock-3',
    title: '提交实验报告',
    category: '学业',
    priority: '高',
    estimated_min: 45,
    start_time: '',
    status: '未完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:03.000Z',
  },
  {
    id: 'mock-4',
    title: '跑步 3 公里',
    category: '运动',
    priority: '低',
    estimated_min: 40,
    start_time: '',
    status: '已完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:04.000Z',
  },
  {
    id: 'mock-5',
    title: '给家里打电话',
    category: '生活',
    priority: '低',
    estimated_min: 15,
    start_time: '',
    status: '未完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:05.000Z',
  },
  {
    id: 'mock-6',
    title: '复盘今天',
    category: '学习',
    priority: '中',
    estimated_min: 20,
    start_time: '',
    status: '已完成',
    plan_date: T,
    created_at: '2026-10-10T00:00:06.000Z',
  },
]
