import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import type { ChatMessage } from '../types';
import clsx from 'clsx';

interface ChatProps {
    matchId: string;
}

const Chat: React.FC<ChatProps> = ({ matchId }) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [username, setUsername] = useState(localStorage.getItem('chat_username') || '');
    const [isJoined, setIsJoined] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!socket || !isJoined) return;

        const handleChatMessage = (msg: ChatMessage) => {
            if (msg.matchId === matchId) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        };

        const handleUserJoined = (_data: { username: string }) => {
            // Optional: Add system message
        };

        const handleTyping = (data: { username: string; isTyping: boolean }) => {
            setTypingUsers((prev) => {
                if (data.isTyping) {
                    return prev.includes(data.username) ? prev : [...prev, data.username];
                } else {
                    return prev.filter((u) => u !== data.username);
                }
            });
        };

        socket.on('chat_message', handleChatMessage);
        socket.on('user_joined', handleUserJoined);
        socket.on('typing_indicator', handleTyping);

        return () => {
            socket.off('chat_message', handleChatMessage);
            socket.off('user_joined', handleUserJoined);
            socket.off('typing_indicator', handleTyping);
        };
    }, [socket, isJoined, matchId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !socket) return;

        localStorage.setItem('chat_username', username);
        const userId = localStorage.getItem('chat_userId') || Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_userId', userId);

        socket.emit('join_chat', { matchId, username, userId });
        setIsJoined(true);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socket) return;

        // Optimistic update not needed as we get echo back, but for better UX we might?
        // Let's rely on server for now to ensure consistency

        // Note: The prompt says "Emit send_message", let's assume the event name is 'send_message'
        socket.emit('send_message', {
            matchId,
            message: inputMessage,
            username,
            userId: localStorage.getItem('chat_userId')
        });

        setInputMessage('');
        handleTypingStop();
    };

    const handleTypingStart = () => {
        if (!socket) return;
        socket.emit('typing_start', { matchId, username });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(handleTypingStop, 2000) as unknown as number;
    };

    const handleTypingStop = () => {
        if (!socket) return;
        socket.emit('typing_stop', { matchId, username });
    };

    if (!isJoined) {
        return (
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto border border-slate-200 text-center shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Join Live Chat</h3>
                <form onSubmit={handleJoin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Join Chat
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 h-[500px] flex flex-col shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={idx} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                            <div className={clsx(
                                "max-w-[80%] rounded-lg px-4 py-2",
                                isMe ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                            )}>
                                {!isMe && <div className="text-xs font-bold text-slate-500 mb-1">{msg.username}</div>}
                                <div>{msg.message}</div>
                            </div>
                            {/* <div className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div> */}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-xs text-slate-500 italic">
                    {typingUsers.join(', ')} is typing...
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => {
                            setInputMessage(e.target.value);
                            handleTypingStart();
                        }}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !inputMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
