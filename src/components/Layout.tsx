import { ReactNode } from 'react';
import { motion } from 'motion/react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1025] via-[#05050a] to-[#000000] text-white font-sans selection:bg-accent/30 selection:text-white">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50 mix-blend-overlay"></div>
      
      <header className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <h1 className="text-2xl font-serif font-bold tracking-tighter text-white">
            DUNIA<span className="text-accent">.</span>
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          {/* User Profile or Menu could go here */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-800 border border-white/10" />
        </motion.div>
      </header>

      <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
