import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { User, World, Player, Message } from '../types';

interface GameContextType {
  socket: Socket | null;
  user: User | null;
  currentWorld: World | null;
  myPlayer: Player | null;
  messages: Message[];
  worlds: World[];
  players: any[];
  joinWorld: (worldId: string) => void;
  createWorld: (worldData: Partial<World>) => Promise<void>;
  sendMessage: (content: string, emotion: string) => void;
  changePhase: (phase: string) => void;
  refreshWorlds: () => void;
  submitDeduction: (targetUserId: string, guessedRole: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  // Initialize User
  useEffect(() => {
    const storedUserId = localStorage.getItem('dunia_user_id');
    const storedUsername = localStorage.getItem('dunia_username');
    
    if (storedUserId && storedUsername) {
      setUser({ id: storedUserId, username: storedUsername });
    } else {
      const newUserId = nanoid();
      const newUsername = `Traveler-${nanoid(4)}`;
      localStorage.setItem('dunia_user_id', newUserId);
      localStorage.setItem('dunia_username', newUsername);
      setUser({ id: newUserId, username: newUsername });
    }
  }, []);

  // Initialize Socket
  useEffect(() => {
    if (!user) return;

    const newSocket = io(window.location.origin, {
      query: { userId: user.id, username: user.username },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('init_messages', (msgs: Message[]) => {
      setMessages(msgs);
    });

    newSocket.on('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('my_role', (player: Player) => {
      setMyPlayer(player);
    });

    newSocket.on('world_players', (pl: any[]) => {
      setPlayers(pl);
    });
    
    newSocket.on('world_update', (update: any) => {
        if (update.type === 'phase_change' && currentWorld) {
            setCurrentWorld(prev => prev ? { ...prev, phase: update.phase } : null);
        }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const refreshWorlds = async () => {
    try {
      const res = await fetch('/api/worlds');
      const data = await res.json();
      setWorlds(data);
    } catch (err) {
      console.error("Failed to fetch worlds", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshWorlds();
  }, []);

  const joinWorld = (worldId: string) => {
    if (!socket || !user) return;
    socket.emit('join_world', { worldId, userId: user.id, username: user.username });
    
    // Fetch world details
    fetch(`/api/worlds/${worldId}`)
      .then(res => res.json())
      .then(data => setCurrentWorld(data));
  };

  const createWorld = async (worldData: Partial<World>) => {
    if (!user) return;
    const res = await fetch('/api/worlds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...worldData, admin_id: user.id }),
    });
    if (res.ok) {
      refreshWorlds();
    }
  };

  const sendMessage = (content: string, emotion: string) => {
    if (!socket || !user || !currentWorld) return;
    socket.emit('send_message', {
      worldId: currentWorld.id,
      userId: user.id,
      content,
      emotion
    });
  };
  
  const changePhase = (phase: string) => {
      if (!socket || !user || !currentWorld) return;
      // In a real app, we'd validate admin status here or on server more strictly
      socket.emit('admin_action', {
          worldId: currentWorld.id,
          action: 'change_phase',
          payload: { phase }
      });
  };

  const submitDeduction = (targetUserId: string, guessedRole: string) => {
    if (!socket || !currentWorld) return;
    socket.emit('submit_deduction', { worldId: currentWorld.id, targetUserId, guessedRole });
  };

  return (
    <GameContext.Provider value={{ 
      socket, user, currentWorld, myPlayer, messages, worlds, players,
      joinWorld, createWorld, sendMessage, changePhase, refreshWorlds, submitDeduction
    }}>
      {children}
    </GameContext.Provider>
  );
};
