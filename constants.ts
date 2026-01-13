
import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    birdCountRange: [3, 4],
    speedRange: [2, 3],
    stayDuration: 1.5,
    occlusionDensity: 0.1,
    description: "入门：仔细观察，它们飞得很慢。"
  },
  {
    id: 2,
    birdCountRange: [4, 6],
    speedRange: [2.5, 3.5],
    stayDuration: 1.5,
    occlusionDensity: 0.2,
    description: "初级：数量略微增加。"
  },
  {
    id: 3,
    birdCountRange: [5, 7],
    speedRange: [3, 4],
    stayDuration: 1.5,
    occlusionDensity: 0.3,
    description: "中级：开始有重叠出现了。"
  },
  {
    id: 4,
    birdCountRange: [5, 10],
    speedRange: [6, 10],
    stayDuration: 1.0,
    occlusionDensity: 0.5,
    description: "高级：速度变快，停留时间缩短。"
  },
  {
    id: 5,
    birdCountRange: [20, 40],
    speedRange: [10, 15],
    stayDuration: 0.5,
    occlusionDensity: 0.8,
    description: "专家：极速挑战，密集成群！"
  }
];

export const BIRD_COLORS = [
  '#fbbf24', // Yellow
  '#f87171', // Red
  '#60a5fa', // Blue
  '#34d399', // Green
  '#a78bfa', // Purple
  '#f472b6', // Pink
];
