import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database Setup
const db = new Database("dunia.db");
db.pragma("journal_mode = WAL");

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS worlds (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT,
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0,
    status TEXT DEFAULT 'preparation', -- preparation, active, locked, finished
    phase TEXT DEFAULT 'setup', -- setup, conflict, crisis, climax, epilog
    admin_id TEXT NOT NULL,
    rules TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role_name TEXT,
    role_description TEXT,
    role_alignment TEXT,
    is_admin BOOLEAN DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(world_id) REFERENCES worlds(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL,
    sender_id TEXT, -- NULL for system messages
    content TEXT NOT NULL,
    emotion TEXT, -- angry, afraid, calm, suspicious, sad
    type TEXT DEFAULT 'chat', -- chat, system, admin, secret
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(world_id) REFERENCES worlds(id)
  );
  
  CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL,
    target_role TEXT, -- NULL for global
    content TEXT NOT NULL,
    is_revealed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Game Logic API ---

  // Get all worlds
  app.get("/api/worlds", (req, res) => {
    const stmt = db.prepare("SELECT * FROM worlds ORDER BY created_at DESC");
    const worlds = stmt.all();
    res.json(worlds);
  });

  // Create a world
  app.post("/api/worlds", (req, res) => {
    const { title, genre, description, max_players, admin_id, rules } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    const stmt = db.prepare(`
      INSERT INTO worlds (id, title, genre, description, max_players, admin_id, rules)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run(id, title, genre, description, max_players, admin_id, rules);
      res.json({ id, title });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create world" });
    }
  });

  // Get world details
  app.get("/api/worlds/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("SELECT * FROM worlds WHERE id = ?");
    const world = stmt.get(id);
    if (world) {
      res.json(world);
    } else {
      res.status(404).json({ error: "World not found" });
    }
  });

  // Socket.IO Logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_world", ({ worldId, userId, username }) => {
      socket.join(worldId);
      
      // Ensure user exists
      const userStmt = db.prepare("INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)");
      userStmt.run(userId, username);

      // Check if player already joined
      const playerStmt = db.prepare("SELECT * FROM players WHERE world_id = ? AND user_id = ?");
      const existingPlayer = playerStmt.get(worldId, userId);

      if (!existingPlayer) {
        // Assign Role Logic (Simplified for MVP: Random assignment if roles existed, or placeholder)
        // For MVP, we'll just add them as a generic player first, roles assigned later or on join
        // Let's generate a random role for now since the prompt says "System randomizes role on join"
        
        const roles = [
            { name: "The Observer", description: "You watch from the shadows.", alignment: "Neutral" },
            { name: "The Instigator", description: "Create chaos.", alignment: "Chaos" },
            { name: "The Peacemaker", description: "Try to keep everyone calm.", alignment: "Order" },
            { name: "The Traitor", description: "Betray the group at the right moment.", alignment: "Evil" },
            { name: "The Leader", description: "Guide the group to safety.", alignment: "Good" }
        ];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        
        const playerId = Math.random().toString(36).substring(2, 15);
        const insertPlayer = db.prepare(`
            INSERT INTO players (id, world_id, user_id, role_name, role_description, role_alignment)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertPlayer.run(playerId, worldId, userId, randomRole.name, randomRole.description, randomRole.alignment);
        
        // Update player count
        db.prepare("UPDATE worlds SET current_players = current_players + 1 WHERE id = ?").run(worldId);
      }

      // Send initial data to user
      const messages = db.prepare("SELECT * FROM messages WHERE world_id = ? ORDER BY created_at ASC").all(worldId);
      socket.emit("init_messages", messages);
      
      // Send player their role
      const myPlayer = db.prepare("SELECT * FROM players WHERE world_id = ? AND user_id = ?").get(worldId, userId);
      socket.emit("my_role", myPlayer);

      // Send list of players (masked roles)
      const players = db.prepare("SELECT id, user_id, joined_at FROM players WHERE world_id = ?").all(worldId);
      // We need to map user_ids to usernames
      const playersWithNames = players.map(p => {
        const u = db.prepare("SELECT username FROM users WHERE id = ?").get(p.user_id);
        return { ...p, username: u.username };
      });
      io.to(worldId).emit("world_players", playersWithNames);
    });

    socket.on("submit_deduction", ({ worldId, targetUserId, guessedRole }) => {
        // Logic for deduction
        // For MVP, just log it or broadcast a "Someone is suspicious" message
        const msgId = Math.random().toString(36).substring(2, 15);
        const content = `👁 Someone is analyzing ${targetUserId}...`; // In real app use username
        db.prepare("INSERT INTO messages (id, world_id, content, type) VALUES (?, ?, ?, ?)").run(msgId, worldId, content, "system");
        io.to(worldId).emit("new_message", { id: msgId, world_id: worldId, content, type: "system" });
    });

    socket.on("send_message", ({ worldId, userId, content, emotion }) => {
      const msgId = Math.random().toString(36).substring(2, 15);
      const stmt = db.prepare(`
        INSERT INTO messages (id, world_id, sender_id, content, emotion)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(msgId, worldId, userId, content, emotion);

      const msg = db.prepare("SELECT * FROM messages WHERE id = ?").get(msgId);
      io.to(worldId).emit("new_message", msg);
    });
    
    socket.on("admin_action", ({ worldId, action, payload }) => {
        // Verify admin (simplified for MVP, trusting client sending admin flag or checking DB)
        // In real app, check session/token.
        
        if (action === "change_phase") {
            db.prepare("UPDATE worlds SET phase = ? WHERE id = ?").run(payload.phase, worldId);
            io.to(worldId).emit("world_update", { type: "phase_change", phase: payload.phase });
            
            // System message
            const msgId = Math.random().toString(36).substring(2, 15);
            const content = `🌌 The phase has shifted to: ${payload.phase.toUpperCase()}`;
            db.prepare("INSERT INTO messages (id, world_id, content, type) VALUES (?, ?, ?, ?)").run(msgId, worldId, content, "system");
            io.to(worldId).emit("new_message", { id: msgId, world_id: worldId, content, type: "system" });
        }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
