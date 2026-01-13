
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Bird, LevelConfig } from './types';
import { LEVELS, BIRD_COLORS } from './constants';
import { BirdCanvas } from './components/BirdCanvas';
import { Numpad } from './components/Numpad';
import { MusicEngine } from './components/MusicEngine';

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [inputTimer, setInputTimer] = useState(3);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; actual: number; guessed: number; gainedPoints: number } | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const birdCountRef = useRef(0);

  // Sound placeholders or simple visual cues for timing
  const generateBirds = useCallback(() => {
    const [min, max] = currentLevel.birdCountRange;
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    birdCountRef.current = count;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const newBirds: Bird[] = Array.from({ length: count }).map((_, i) => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? -50 : viewportWidth + 50;
      const endX = fromLeft ? viewportWidth + 50 : -50;
      const startY = Math.random() * viewportHeight;
      const endY = Math.random() * viewportHeight;
      
      return {
        id: `bird-${i}`,
        startX,
        startY,
        controlX: viewportWidth / 2 + (Math.random() - 0.5) * 400,
        controlY: viewportHeight / 2 + (Math.random() - 0.5) * 400,
        endX,
        endY,
        startTime: Math.random() * (currentLevel.id === 5 ? 0.3 : 0.8), // staggered start
        duration: (10 / currentLevel.speedRange[0]) + Math.random() * 0.5,
        size: 15 + Math.random() * 15,
        color: BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)],
        wingFlapSpeed: 15 + Math.random() * 10
      };
    });

    setBirds(newBirds);
  }, [currentLevel]);

  const handleConfirm = useCallback(() => {
    if (gameState !== GameState.INPUT) return;

    const guessed = parseInt(userInput) || 0;
    const actual = birdCountRef.current;
    const isCorrect = guessed === actual;

    // Base score calculation
    const baseScore = currentLevel.id === 5 ? 100 : 10 * currentLevel.id;
    let gainedPoints = 0;

    if (isCorrect) {
      // Perfect match: base + streak bonus
      gainedPoints = baseScore + (streak * 5);
      setStreak(s => s + 1);
    } else if (guessed < actual && guessed > 0) {
      // Under-counting: percentage points, but reset streak
      const percentage = guessed / actual;
      gainedPoints = Math.floor(baseScore * percentage);
      setStreak(0);
    } else {
      // Over-counting or 0: no points, reset streak
      gainedPoints = 0;
      setStreak(0);
    }

    setScore(s => s + gainedPoints);
    setLastResult({ isCorrect, actual, guessed, gainedPoints });
    setGameState(GameState.FEEDBACK);

    // Auto move to next level after delay
    setTimeout(() => {
      if (currentLevelIndex < LEVELS.length - 1) {
        const nextIdx = currentLevelIndex + 1;
        setCurrentLevelIndex(nextIdx);
        startLevel(nextIdx);
      } else {
        setGameState(GameState.GAMEOVER);
      }
    }, 2500);
  }, [gameState, userInput, currentLevel, streak, currentLevelIndex]);

  // Phase transitions
  const startGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentLevelIndex(0);
    startLevel(0);
    setIsMusicEnabled(true);
  };

  const startLevel = (index: number) => {
    setCountdown(3);
    setInputTimer(3);
    setGameState(GameState.COUNTDOWN);
    setUserInput('');
    setLastResult(null);
  };

  // Level start countdown effect
  useEffect(() => {
    let timer: number;
    if (gameState === GameState.COUNTDOWN) {
      if (countdown > 0) {
        timer = window.setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        generateBirds();
        setGameState(GameState.PRESENTING);
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown, generateBirds]);

  // Input phase countdown effect
  useEffect(() => {
    let timer: number;
    if (gameState === GameState.INPUT) {
      if (inputTimer > 0) {
        timer = window.setTimeout(() => setInputTimer(t => t - 1), 1000);
      } else {
        handleConfirm();
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, inputTimer, handleConfirm]);

  const handlePresentationComplete = () => {
    setInputTimer(3);
    setGameState(GameState.INPUT);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.INPUT) return;
      if (/[0-9]/.test(e.key)) {
        setUserInput(prev => prev + e.key);
      } else if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Backspace') {
        setUserInput(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, userInput, handleConfirm]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden select-none">
      
      <MusicEngine isEnabled={isMusicEnabled} gameState={gameState} />

      {/* HUD Header */}
      <header className="p-4 flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur shadow-md">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">当前关卡</span>
            <span className="text-2xl font-black text-amber-400">{currentLevel.id} / 5</span>
          </div>
          <button 
            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
            className={`p-2 rounded-lg transition-colors ${isMusicEnabled ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 bg-slate-800'}`}
            title={isMusicEnabled ? "关闭音乐" : "开启音乐"}
          >
            {isMusicEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeDasharray="5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-center hidden sm:block">
          <h1 className="text-xl font-black italic tracking-tighter text-white">瞬间计数挑战</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{currentLevel.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">累计分数</span>
          <span className="text-2xl font-black text-emerald-400 tabular-nums">{score.toLocaleString()}</span>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        
        {/* Bird Canvas Rendering */}
        {gameState === GameState.PRESENTING && (
          <BirdCanvas 
            birds={birds} 
            isActive={true} 
            onComplete={handlePresentationComplete} 
          />
        )}

        {/* Start Screen */}
        {gameState === GameState.START && (
          <div className="text-center z-20 animate-in fade-in zoom-in duration-500 px-4 flex flex-col items-center">
            <div className="mb-6 relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                 <span className="text-5xl sm:text-6xl">🐦</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">准备好你的眼睛了吗？</h2>
            
            {/* Scoring Rules Display */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 max-w-md w-full mb-8 text-left shadow-xl backdrop-blur">
              <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3 border-b border-slate-700 pb-2">得分规则：</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2 font-black">★</span>
                  <span><strong>精准计数：</strong> 获得基础分 + 连击奖励（每连击一次 +5分）。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2 font-black">★</span>
                  <span><strong>漏算补偿：</strong> 若输入的数量<strong>小于</strong>实际数量，将按比例获得得分，但连击会重置。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2 font-black">★</span>
                  <span><strong>多算惩罚：</strong> 若输入的数量<strong>大于</strong>实际数量，则本轮不得分，连击重置。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2 font-black">★</span>
                  <span><strong>限时回答：</strong> 必须在 <strong>3秒</strong> 内提交答案，超时视为0分。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2 font-black">★</span>
                  <span><strong>基础得分：</strong> 关卡越高，基础分越高（第5关基础分为 100）。</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={startGame}
              className="px-12 py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-2xl font-black rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              开始挑战
            </button>
          </div>
        )}

        {/* Countdown */}
        {gameState === GameState.COUNTDOWN && (
          <div className="text-center z-20">
            <div className="text-8xl sm:text-[10rem] font-black animate-ping text-amber-400">
              {countdown}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-400 uppercase tracking-widest">准备展示...</p>
          </div>
        )}

        {/* Input Phase */}
        {gameState === GameState.INPUT && (
          <div className="w-full max-w-sm mx-4 px-6 py-8 bg-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl border border-slate-700 z-20 relative">
            {/* Input Timer Overlay */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 px-6 py-1 rounded-full text-white font-black text-lg shadow-lg animate-pulse z-30">
              剩余时间: {inputTimer}s
            </div>

            <h3 className="text-xl text-center font-bold text-slate-300 mb-6 uppercase tracking-widest pt-4">
              你看到了多少只？
            </h3>
            <div className="text-center mb-8">
              <div className="text-6xl font-black text-white h-20 flex items-center justify-center border-b-4 border-amber-500 w-32 mx-auto tabular-nums">
                {userInput || "?"}
              </div>
            </div>
            <Numpad 
              value={userInput} 
              onChange={setUserInput} 
              onConfirm={handleConfirm}
              onClear={() => setUserInput('')}
            />
          </div>
        )}

        {/* Feedback Phase */}
        {gameState === GameState.FEEDBACK && lastResult && (
          <div className={`text-center z-20 animate-in zoom-in duration-300 ${lastResult.isCorrect ? 'text-emerald-400' : (lastResult.gainedPoints > 0 ? 'text-amber-400' : 'text-red-400')}`}>
            <div className="text-8xl mb-4">
              {lastResult.isCorrect ? '✓' : (lastResult.gainedPoints > 0 ? '±' : '✗')}
            </div>
            <h2 className="text-4xl font-black mb-2">
              {lastResult.isCorrect ? '完美正确！' : (lastResult.gainedPoints > 0 ? '计数较接近' : '多算或漏算过多')}
            </h2>
            <p className="text-2xl text-slate-300">
              正确答案是: <span className="font-black text-white">{lastResult.actual}</span>
            </p>
            <p className="text-lg mt-2 opacity-70">
              你的回答: {lastResult.guessed}
            </p>
            <div className="mt-4 text-3xl font-black text-white">
              +{lastResult.gainedPoints} 分
            </div>
            {streak > 1 && lastResult.isCorrect && (
              <div className="mt-6 inline-block bg-amber-500 text-slate-900 px-6 py-2 rounded-full font-black animate-bounce shadow-lg">
                连击 X{streak}!
              </div>
            )}
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAMEOVER && (
          <div className="text-center z-20 p-8 bg-slate-800/90 rounded-3xl border border-slate-700 shadow-2xl mx-4">
            <h2 className="text-5xl font-black mb-4 text-emerald-400 italic">挑战圆满结束!</h2>
            <p className="text-xl text-slate-400 mb-8">最终获得的总分</p>
            <div className="text-7xl font-black mb-12 text-white tabular-nums">
              {score.toLocaleString()}
            </div>
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              再试一次
            </button>
          </div>
        )}
      </main>

      {/* Visual background details */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>
      
      {/* Footer Instructions */}
      <footer className="p-4 text-center text-slate-600 text-[10px] uppercase tracking-tighter">
        使用键盘数字或点击面板输入 • 回车键确认 • 音乐由 Web Audio API 实时合成
      </footer>
    </div>
  );
};

export default App;
