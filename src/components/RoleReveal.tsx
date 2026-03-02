import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

interface RoleRevealProps {
  player: Player | null;
}

export default function RoleReveal({ player }: RoleRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!player) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-72 glass-panel p-6 rounded-2xl border border-accent/30 shadow-2xl shadow-accent/10"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-serif text-white">Your Identity</h3>
              <span className={`text-xs px-2 py-1 rounded border ${
                player.role_alignment === 'Good' ? 'border-green-500/30 text-green-400' :
                player.role_alignment === 'Evil' ? 'border-red-500/30 text-red-400' :
                'border-yellow-500/30 text-yellow-400'
              }`}>
                {player.role_alignment}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-2xl font-bold text-accent mb-1">{player.role_name}</p>
              <p className="text-sm text-gray-400 italic">{player.role_description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                <Shield size={12} />
                <span>HIDDEN FROM OTHERS</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                <Zap size={12} />
                <span>ABILITY: LOCKED (MVP)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsRevealed(!isRevealed)}
        className="glass-panel p-4 rounded-full hover:bg-white/10 transition-colors border border-white/10 group relative"
      >
        {isRevealed ? <EyeOff size={24} className="text-accent" /> : <Eye size={24} className="text-gray-400 group-hover:text-white" />}
        {!isRevealed && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
