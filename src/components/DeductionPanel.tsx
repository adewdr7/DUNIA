import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function DeductionPanel() {
  const { players, submitDeduction, myPlayer } = useGame();
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const roles = ["The Observer", "The Instigator", "The Peacemaker", "The Traitor", "The Leader"];

  const handleSubmit = () => {
    if (selectedTarget && selectedRole) {
      submitDeduction(selectedTarget, selectedRole);
      setSelectedTarget('');
      setSelectedRole('');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center space-x-2 text-accent mb-2">
        <Search size={16} />
        <h3 className="text-lg font-serif font-bold text-white">Deduction Board</h3>
      </div>
      
      <p className="text-xs text-gray-400 font-mono mb-4">
        Analyze behavior. Uncover the truth. Your guesses shape the world's stability.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1">Suspect</label>
          <select 
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent focus:outline-none"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            <option value="">Select a player...</option>
            {players.filter(p => p.user_id !== myPlayer?.user_id).map(p => (
              <option key={p.id} value={p.user_id}>{p.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1">Suspected Role</label>
          <select 
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent focus:outline-none"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select a role...</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!selectedTarget || !selectedRole}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <AlertCircle size={12} />
          <span>Submit Theory</span>
        </button>
      </div>
    </div>
  );
}
