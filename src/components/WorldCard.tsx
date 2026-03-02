import { FC } from 'react';
import { World } from '../types';
import { Users, Lock, Play, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WorldCardProps {
  world: World;
  onJoin: (id: string) => void;
}

const WorldCard: FC<WorldCardProps> = ({ world, onJoin }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl hover:border-accent/50 transition-colors cursor-pointer group"
      onClick={() => onJoin(world.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider">{world.genre}</span>
          <h3 className="text-xl font-serif font-semibold text-white mt-1 group-hover:text-accent transition-colors">{world.title}</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded-full">
          <Users size={12} />
          <span>{world.current_players}/{world.max_players}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-sans font-light">
        {world.description}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded border ${
            world.status === 'active' ? 'border-green-500/30 text-green-400' : 
            world.status === 'locked' ? 'border-red-500/30 text-red-400' : 
            'border-blue-500/30 text-blue-400'
          }`}>
            {world.status.toUpperCase()}
          </span>
          <span>{world.phase.toUpperCase()}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-accent flex items-center">
          JOIN <Play size={10} className="ml-1 fill-current" />
        </div>
      </div>
    </motion.div>
  );
}

export default WorldCard;
