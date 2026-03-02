import { useState } from 'react';
import { useGame } from '../context/GameContext';
import WorldCard from '../components/WorldCard';
import CreateWorldModal from '../components/CreateWorldModal';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Lobby() {
  const { worlds, joinWorld, createWorld } = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (data: any) => {
    await createWorld(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-white mb-2">Multiverse Lobby</h2>
          <p className="text-gray-400 font-mono text-sm max-w-md">
            Select a universe to inhabit. Each world has its own rules, secrets, and destiny.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
        >
          <Plus size={20} />
          <span>Forge World</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worlds.map((world) => (
          <WorldCard key={world.id} world={world} onJoin={joinWorld} />
        ))}
        
        {worlds.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 font-mono border border-dashed border-white/10 rounded-2xl">
            No worlds found. Be the first Architect.
          </div>
        )}
      </div>

      <CreateWorldModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreate} 
      />
    </div>
  );
}
