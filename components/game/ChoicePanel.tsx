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
    <footer className="w-full mt-3 flex flex-col gap-2 max-h-[24vh] overflow-y-auto pr-2 vn-scroll">
      {choices.map((choice, index) => {
        const { Icon } = getChoiceMeta(choice.consequence_hint);
        
        return (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            className="group relative flex items-center gap-3 rounded-full bg-[rgba(30,18,8,0.82)] px-6 py-3 text-left border border-[rgba(180,130,60,0.35)] hover:border-[rgba(210,160,60,0.9)] hover:bg-[rgba(40,24,10,0.86)] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex-shrink-0 text-amber-200/80 group-hover:text-amber-200 transition-colors relative z-10">
              <Icon size={20} />
            </div>
            
            <div className="flex flex-col flex-1 z-10 relative">
              <div className="text-[0.95rem] font-normal text-white leading-relaxed">
                {choice.label}
              </div>
            </div>

            {choice.consequence_hint && (
              <div className="ml-4 text-[9px] uppercase tracking-[0.2em] text-amber-200/60">
                {choice.consequence_hint}
              </div>
            )}
          </motion.button>
        );
      })}
    </footer>
  );
};
