
import React, { useEffect, useRef } from 'react';

interface MusicEngineProps {
  isEnabled: boolean;
  gameState: string;
}

export const MusicEngine: React.FC<MusicEngineProps> = ({ isEnabled, gameState }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const schedulerTimerRef = useRef<number | null>(null);

  const NOTES = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  const tempo = 120;
  const secondsPerBeat = 60.0 / tempo;

  const playNote = (time: number, freq: number, duration: number, volume: number) => {
    if (!audioCtxRef.current) return;
    
    const osc = audioCtxRef.current.createOscillator();
    const noteGain = audioCtxRef.current.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(volume * 0.2, time + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(noteGain);
    if (gainNodeRef.current) {
      noteGain.connect(gainNodeRef.current);
    }

    osc.start(time);
    osc.stop(time + duration);
  };

  const scheduleBeat = (beatTime: number, beatCount: number) => {
    if (!isPlayingRef.current) return;

    // Bass line
    const bassFreq = beatCount % 4 === 0 ? 130.81 : 164.81; // C3 or E3
    playNote(beatTime, bassFreq, secondsPerBeat * 0.8, 0.15);

    // Melody
    if (beatCount % 2 === 0) {
      const noteIndex = Math.floor(Math.random() * NOTES.length);
      playNote(beatTime, NOTES[noteIndex], secondsPerBeat * 0.4, 0.1);
    }

    // High hat-ish click
    playNote(beatTime, 800 + Math.random() * 200, 0.02, 0.05);

    const nextBeatTime = beatTime + secondsPerBeat;
    schedulerTimerRef.current = window.setTimeout(() => {
      scheduleBeat(nextBeatTime, beatCount + 1);
    }, secondsPerBeat * 1000);
  };

  useEffect(() => {
    if (isEnabled && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
    }

    if (isEnabled && !isPlayingRef.current) {
      isPlayingRef.current = true;
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        scheduleBeat(audioCtxRef.current.currentTime + 0.1, 0);
      }
    } else if (!isEnabled && isPlayingRef.current) {
      isPlayingRef.current = false;
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
    }

    return () => {
      isPlayingRef.current = false;
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
    };
  }, [isEnabled]);

  // Adjust volume/tempo based on game state
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = gameState === 'PRESENTING' ? 0.5 : 0.2;
      gainNodeRef.current.gain.linearRampToValueAtTime(targetGain, audioCtxRef.current.currentTime + 1);
    }
  }, [gameState]);

  return null;
};
