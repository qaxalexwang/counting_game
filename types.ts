
export enum GameState {
  START = 'START',
  COUNTDOWN = 'COUNTDOWN',
  PRESENTING = 'PRESENTING',
  INPUT = 'INPUT',
  FEEDBACK = 'FEEDBACK',
  GAMEOVER = 'GAMEOVER'
}

export interface LevelConfig {
  id: number;
  birdCountRange: [number, number];
  speedRange: [number, number];
  stayDuration: number; // in seconds
  occlusionDensity: number; // 0 to 1
  description: string;
}

export interface Bird {
  id: string;
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  size: number;
  color: string;
  wingFlapSpeed: number;
}
