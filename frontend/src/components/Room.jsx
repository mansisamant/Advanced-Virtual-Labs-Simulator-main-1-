import React, { useState, useEffect } from 'react';
import socket, { joinRoom, leaveRoom, sendContentChange, checkRoom } from '../socket';
import ResponsiveHeader from './shared-components/Header';
import Footer from './shared-components/Footer';
import { UserCircle } from 'lucide-react';

const roomAnimations = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    25% { background-position: 0 0; }
    75% { background-position: 1000px 0; }
    100% { background-position: 1000px 0; }
  }
`;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Connect to socket
  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(socket.connected);

    const onConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('Socket connected');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const onConnectError = (err) => {
      console.log('Connection error:', err);
      setIsConnecting(false);
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    socket.on('room-created', ({ password }) => {
      setRoomPassword(password);
    });

    socket.on('authentication-failed', () => {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 3000);
    });

    socket.on('user-joined', ({ user, users, content }) => {
      setUsers(users);
      if (content && !inRoom) {
        setContent(content);
      }
      if (user.id === socket.id) {
        setInRoom(true);
      }
    });

    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    socket.on('content-updated', ({ content }) => {
      setContent(content);
    });

    const timeoutId = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-created');
      socket.off('authentication-failed');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('content-updated');
      clearTimeout(timeoutId);
    };
  }, [inRoom]);

  const handleRoomIdChange = async (e) => {
    const newRoomId = e.target.value;
    setRoomId(newRoomId);
    
    if (newRoomId.trim()) {
      const status = await checkRoom(newRoomId);
      setNeedsPassword(status.exists);
    } else {
      setNeedsPassword(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId && username) {
      joinRoom(roomId, username, password);
      setAuthError(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    setInRoom(false);
    setContent('');
    setUsers([]);
    setPassword('');
    setRoomPassword('');
    setNeedsPassword(false);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendContentChange(roomId, newContent);
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = roomAnimations;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/chat-background.gif" 
          alt="background" 
          className="w-full h-full object-cover opacity-5 scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-transparent to-gray-900/70"></div>
      </div>

      <ResponsiveHeader isConnected={isConnected} isConnecting={isConnecting} />
      
      <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"></div>
        
        {!inRoom ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-20"> {/* Changed from max-w-md to max-w-lg */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 
                overflow-hidden shadow-xl shadow-black/10 relative">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent 
                  opacity-50 pointer-events-none animate-[shimmer_4s_ease-in-out_infinite]"></div>
                
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 px-6 py-4 border-b border-gray-700/50">
                  <h2 className="text-xl font-bold text-white">Join a Collaborative Room</h2>
                  <p className="text-gray-400 text-sm mt-1">Connect with others in a shared virtual workspace</p>
                </div>
                
                <div className="p-6 space-y-6 relative">
                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    {/* Form fields with updated styling */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Your Name</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    {/* Room ID field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Room ID</label>
                      <input
                        type="text"
                        value={roomId}
                        onChange={handleRoomIdChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter a unique room identifier"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {needsPassword ? "This room exists and requires a password to join" : "Enter a unique ID to create a new room or join an existing one"}
                      </p>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {needsPassword ? "Room Password" : "Create Room Password (optional)"}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder={needsPassword ? "Enter the room password" : "Create a password (optional)"}
                        required={needsPassword}
                      />
                      {authError && (
                        <p className="text-red-400 text-xs">Incorrect password. Please try again.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 
                        text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 
                        shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30"
                    >
                      {needsPassword ? "Join Room" : "Create/Join Room"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-gray-800/40 backdrop-blur-xl 
              rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl shadow-black/10 
              hover:shadow-teal-500/5 transition-all duration-500">
              <div className="p-4 border-b border-gray-700/50">
                <h2 className="font-semibold text-white">
                  Room: <span className="text-teal-400 font-mono">{roomId}</span>
                </h2>
                
                {roomPassword && (
                  <div className="mt-3 py-2 px-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 font-medium">Room Password</div>
                    <div className="font-mono text-sm mt-1 bg-gray-800/50 px-2 py-1 rounded text-teal-400">
                      {roomPassword}
                    </div>
                  </div>
                )}
              </div>

              {/* Participants list */}
              <div className="p-4 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-300">Participants</h3>
                  <span className="bg-teal-500/20 text-teal-300 text-xs font-medium px-2 py-1 rounded-full">
                    {users.length}
                  </span>
                </div>

                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-sm font-medium">
                        {getUserInitials(user.username)}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-300">
                          {user.username}
                          {user.id === socket.id && (
                            <span className="ml-2 text-xs bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">
                              you
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Leave button */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={handleLeaveRoom}
                  className="w-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 
                    py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Leave Room
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col bg-gray-800/40 backdrop-blur-xl rounded-2xl 
              border border-gray-700/50 overflow-hidden shadow-xl shadow-black/10 
              hover:shadow-teal-500/5 transition-all duration-500">
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                  Collaborative Editor
                </h3>
              </div>

              <div className="flex-1 p-6 bg-gradient-to-b from-transparent to-gray-900/20">
                <textarea
                  className="w-full h-full p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl
                    text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 
                    focus:border-teal-500/50 resize-none transition-all duration-300
                    hover:border-gray-600/50"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing here. Changes will be visible to everyone in real-time."
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;