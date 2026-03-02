import { useGame } from '../context/GameContext';
import ChatPanel from '../components/ChatPanel';
import RoleReveal from '../components/RoleReveal';
import { motion } from 'motion/react';
import { ArrowLeft, Crown, Clock, Users } from 'lucide-react';

import DeductionPanel from '../components/DeductionPanel';

export default function WorldView({ onBack }: { onBack: () => void }) {
  const { currentWorld, messages, sendMessage, myPlayer, changePhase } = useGame();

  if (!currentWorld) return <div className="text-center py-20">Loading Universe...</div>;

  const isAdmin = myPlayer?.is_admin || currentWorld.admin_id === localStorage.getItem('dunia_user_id');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Sidebar / Info Panel */}
      <div className="lg:w-1/3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center space-x-2 mb-4">
          <ArrowLeft size={16} />
          <span>Return to Lobby</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4"
        >
          <div>
            <span className="text-xs font-mono text-accent uppercase tracking-wider">{currentWorld.genre}</span>
            <h2 className="text-3xl font-serif font-bold text-white mt-1">{currentWorld.title}</h2>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400 font-mono border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2">
              <Clock size={14} />
              <span>PHASE: <span className="text-white">{currentWorld.phase.toUpperCase()}</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={14} />
              <span>{currentWorld.current_players}/{currentWorld.max_players}</span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <h4 className="text-xs font-mono text-gray-500 mb-2 uppercase">Core Rules</h4>
            <p className="text-sm text-gray-300 font-light leading-relaxed">
              {currentWorld.rules || "No specific rules set by the Architect."}
            </p>
          </div>

          {isAdmin && (
            <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
              <div className="flex items-center space-x-2 text-accent mb-3">
                <Crown size={16} />
                <span className="text-xs font-bold uppercase">Architect Controls</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['setup', 'conflict', 'crisis', 'climax', 'epilog'].map(phase => (
                    <button
                        key={phase}
                        onClick={() => changePhase(phase)}
                        disabled={currentWorld.phase === phase}
                        className={`text-xs py-2 rounded border transition-colors ${
                            currentWorld.phase === phase 
                            ? 'bg-accent text-white border-accent' 
                            : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/30'
                        }`}
                    >
                        {phase.toUpperCase()}
                    </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <DeductionPanel />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full">
        <ChatPanel 
          messages={messages} 
          onSendMessage={sendMessage} 
          myPlayer={myPlayer}
        />
      </div>

      {/* Role Reveal Overlay */}
      <RoleReveal player={myPlayer} />
    </div>
  );
}
