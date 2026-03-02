import { useState, useRef, useEffect } from 'react';
import { Message, Player } from '../types';
import { Send, Smile, AlertTriangle, Shield, Eye, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, emotion: string) => void;
  myPlayer: Player | null;
}

const emotions = [
  { id: 'calm', icon: Smile, color: 'text-blue-400' },
  { id: 'angry', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'afraid', icon: Eye, color: 'text-purple-400' },
  { id: 'suspicious', icon: Shield, color: 'text-yellow-400' },
  { id: 'sad', icon: Skull, color: 'text-gray-400' },
];

export default function ChatPanel({ messages, onSendMessage, myPlayer }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input, selectedEmotion);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myPlayer?.user_id;
          const isSystem = msg.type === 'system';
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs font-mono text-accent/80 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex flex-col max-w-[80%]",
                isMe ? "self-end items-end" : "self-start items-start"
              )}
            >
              <div className={clsx(
                "px-4 py-2 rounded-2xl text-sm relative group",
                isMe ? "bg-accent/20 text-white rounded-br-none border border-accent/20" : "bg-white/5 text-gray-200 rounded-bl-none border border-white/10"
              )}>
                {msg.emotion && (
                    <div className={clsx(
                        "absolute -top-2 text-xs bg-black/80 px-1.5 rounded-full border border-white/10",
                        isMe ? "-left-2" : "-right-2"
                    )}>
                        {msg.emotion}
                    </div>
                )}
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-1 font-mono">
                {isMe ? 'You' : 'Unknown'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-black/40 border-t border-white/5">
        <div className="flex items-center space-x-2 mb-2 px-1 overflow-x-auto no-scrollbar">
          {emotions.map((emo) => (
            <button
              key={emo.id}
              onClick={() => setSelectedEmotion(emo.id)}
              className={clsx(
                "p-1.5 rounded-lg transition-all flex items-center space-x-1 text-xs uppercase font-mono tracking-wider",
                selectedEmotion === emo.id ? "bg-white/10 text-white ring-1 ring-white/20" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <emo.icon size={14} className={emo.color} />
              <span>{emo.id}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Whisper into the void..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-accent/20 hover:bg-accent/40 text-accent rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-accent/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
