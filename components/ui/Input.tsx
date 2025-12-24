
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <input
        {...props}
        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-600 text-base"
      />
    </div>
  );
};
