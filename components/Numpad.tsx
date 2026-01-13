
import React from 'react';

interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({ 
  value, 
  onChange, 
  onConfirm, 
  onClear,
  disabled = false 
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className={`grid grid-cols-3 gap-3 max-w-xs mx-auto ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {digits.map((digit) => (
        <button
          key={digit}
          onClick={() => onChange(value + digit)}
          className="bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg border-b-4 border-slate-900"
        >
          {digit}
        </button>
      ))}
      <button
        onClick={onClear}
        className="bg-red-500 hover:bg-red-400 text-white text-xl font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg border-b-4 border-red-700 col-span-1"
      >
        清除
      </button>
      <button
        onClick={onConfirm}
        className="bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg border-b-4 border-emerald-700 col-span-2"
      >
        确定 (Enter)
      </button>
    </div>
  );
};
