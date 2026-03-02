import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateWorldModal({ isOpen, onClose, onSubmit }: CreateWorldModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Mystery',
    description: '',
    max_players: 5,
    rules: ''
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-panel w-full max-w-md rounded-2xl p-6 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-serif text-white mb-6">Create New World</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">World Title</label>
              <input 
                type="text" 
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                placeholder="The Silent Station"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Genre</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  value={formData.genre}
                  onChange={e => setFormData({...formData, genre: e.target.value})}
                >
                  <option value="Mystery">Mystery</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Horror">Horror</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Dystopian">Dystopian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Max Players</label>
                <input 
                  type="number" 
                  min="3" 
                  max="10"
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                  value={formData.max_players}
                  onChange={e => setFormData({...formData, max_players: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Description (The Hook)</label>
              <textarea 
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none h-24 resize-none"
                placeholder="A brief summary of the setting and conflict..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Core Rules</label>
              <textarea 
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none h-20 resize-none"
                placeholder="1. Trust no one. 2. Night phase is silent..."
                value={formData.rules}
                onChange={e => setFormData({...formData, rules: e.target.value})}
              />
            </div>

            <button 
              onClick={() => onSubmit(formData)}
              className="w-full bg-accent hover:bg-accent/80 text-white font-medium py-3 rounded-lg transition-colors mt-2"
            >
              Forge World
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
