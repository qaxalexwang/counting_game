
import React, { useEffect, useRef, useCallback } from 'react';
import { Bird } from '../types';

interface BirdCanvasProps {
  birds: Bird[];
  isActive: boolean;
  onComplete: () => void;
}

export const BirdCanvas: React.FC<BirdCanvasProps> = ({ birds, isActive, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: animationRef needs an initial value to match expected 1 argument for useRef
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird, elapsed: number) => {
    // Quadratic Bezier interpolation: (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
    const t = Math.min(elapsed / bird.duration, 1);
    const x = (1 - t) * (1 - t) * bird.startX + 2 * (1 - t) * t * bird.controlX + t * t * bird.endX;
    const y = (1 - t) * (1 - t) * bird.startY + 2 * (1 - t) * t * bird.controlY + t * t * bird.endY;

    // Wing flap oscillation
    const flap = Math.sin(elapsed * bird.wingFlapSpeed) * 10;

    ctx.save();
    ctx.translate(x, y);

    // Direction (facing movement)
    const dx = 2 * (1 - t) * (bird.controlX - bird.startX) + 2 * t * (bird.endX - bird.controlX);
    const dy = 2 * (1 - t) * (bird.controlY - bird.startY) + 2 * t * (bird.endY - bird.controlY);
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);

    // Shadow
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';

    // Body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(0, 0, bird.size, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-bird.size * 0.8, -bird.size * 1.5 + flap);
    ctx.lineTo(-bird.size * 1.5, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-bird.size * 0.8, bird.size * 1.5 - flap);
    ctx.lineTo(-bird.size * 1.5, 0);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.size * 0.4, -bird.size * 0.2, bird.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.size * 0.45, -bird.size * 0.2, bird.size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = (time - startTimeRef.current) / 1000;
    const ctx = canvasRef.current?.getContext('2d');
    
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      let allFinished = true;
      birds.forEach(bird => {
        const birdElapsed = elapsed - bird.startTime;
        if (birdElapsed >= 0 && birdElapsed < bird.duration) {
          drawBird(ctx, bird, birdElapsed);
          allFinished = false;
        } else if (birdElapsed < 0) {
          allFinished = false;
        }
      });

      if (allFinished && elapsed > 0.5) {
        onComplete();
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [birds, drawBird, onComplete]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current !== undefined) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current !== undefined) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, animate]);

  // Adjust canvas size to parent
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};
