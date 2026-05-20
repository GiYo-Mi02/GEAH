import React from 'react';
import { Choice } from '@/lib/types';
import { motion } from 'motion/react';
import { Sword, Shield, Eye, MessageCircle, Footprints, Info } from 'lucide-react';

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
}

const getChoiceMeta = (hint?: string) => {
  const lowerHint = hint?.toLowerCase() || '';
  
  let Icon = Info;
  if (lowerHint.includes('stealth') || lowerHint.includes('avoid') || lowerHint.includes('sneak') || lowerHint.includes('hide')) {
    Icon = Footprints;
  } else if (lowerHint.includes('direct') || lowerHint.includes('attack') || lowerHint.includes('force')) {
    Icon = Sword;
  } else if (lowerHint.includes('defend') || lowerHint.includes('protect')) {
    Icon = Shield;
  } else if (lowerHint.includes('reveal') || lowerHint.includes('search') || lowerHint.includes('look')) {
    Icon = Eye;
  } else if (lowerHint.includes('talk') || lowerHint.includes('call')) {
    Icon = MessageCircle;
  }

  let dotColor = 'bg-gray-500'; // Default safe
  if (lowerHint.includes('deadly') || lowerHint.includes('death') || lowerHint.includes('high risk')) {
    dotColor = 'bg-red-500';
  } else if (lowerHint.includes('risky') || lowerHint.includes('injury') || lowerHint.includes('attention')) {
    dotColor = 'bg-yellow-500';
  } else if (lowerHint.includes('safe') || lowerHint.includes('heals')) {
    dotColor = 'bg-green-500';
  }

  return { Icon, dotColor };
};

export const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onSelect, disabled = false }) => {
  return (
    <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
      {choices.map((choice, index) => {
        const { Icon, dotColor } = getChoiceMeta(choice.consequence_hint);
        
        return (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            className="glass-panel rounded-2xl p-6 text-left hover:bg-white/10 transition-all border-l-4 border-l-white/20 hover:border-l-[var(--color-brand-accent)] group relative overflow-hidden disabled:opacity-50 disabled:pointer-events-none flex items-start gap-4"
          >
            <div className="mt-1 flex-shrink-0 text-white/40 group-hover:text-[var(--color-brand-accent)] transition-colors relative z-10">
              <Icon size={20} />
            </div>
            
            <div className="flex flex-col flex-1 z-10 relative">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-2 group-hover:text-[var(--color-brand-accent)] transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
                {choice.consequence_hint || 'Choice'}
              </div>
              <div className="text-sm font-medium text-[#e0d8d0] leading-relaxed">
                {choice.label}
              </div>
            </div>

            {/* Scanline pattern overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)', backgroundSize: '100% 4px' }}
            />
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          </motion.button>
        );
      })}
    </footer>
  );
};
