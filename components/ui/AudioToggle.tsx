"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

export const AudioToggle: React.FC = () => {
  const [isAudioOn, setIsAudioOn] = useState(false);

  useEffect(() => {
    // Sync with localStorage on mount
    const savedPlayState = localStorage.getItem('audio-preference');
    if (savedPlayState === 'on') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAudioOn(true);
      document.body.classList.add('audio-on');
    }
  }, []);

  const toggleAudio = () => {
    setIsAudioOn((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('audio-on');
        localStorage.setItem('audio-preference', 'on');
      } else {
        document.body.classList.remove('audio-on');
        localStorage.setItem('audio-preference', 'off');
      }
      return next;
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAudio}
      className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md text-white/70"
      aria-label="Toggle ambient audio"
    >
      {isAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </motion.button>
  );
};
