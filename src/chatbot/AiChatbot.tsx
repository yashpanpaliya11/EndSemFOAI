import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAiResponse } from '../services/aiService';
import { Globe, X, Send, Bot, User, Trash2 } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

interface ChatbotProps {
    dashboardData: {
        issLoc?: { lat: string; lon: string };
        issSpeed?: number;
        astros?: number;
        newsCount?: number;
        articles?: {
            title: string;
            source: string;
            description: string;
            category: string;
            publishedAt: string;
        }[];
    }
}

export const AiChatbot: React.FC<ChatbotProps> = ({ dashboardData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('chat_history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                } else {
                    throw new Error("Empty array");
                }
            } catch(e) {
                setMessages([{
                    id: 'welcome',
                    role: 'ai',
                    content: 'GREETINGS COMMANDER. I AM MISSION CONTROL AI. HOW CAN I ASSIST YOU WITH THE CURRENT DASHBOARD TELEMETRY?',
                    timestamp: Date.now()
                }]);
            }
        } else {
            setMessages([{
                id: 'welcome',
                role: 'ai',
                content: 'GREETINGS COMMANDER. I AM MISSION CONTROL AI. HOW CAN I ASSIST YOU WITH THE CURRENT DASHBOARD TELEMETRY?',
                timestamp: Date.now()
            }]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages.slice(-30)));
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: 'user_' + Date.now().toString() + '_' + Math.random(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const aiResponse = await generateAiResponse(userMsg.content, dashboardData);

        const aiMsg: ChatMessage = {
            id: 'ai_' + Date.now().toString() + '_' + Math.random(),
            role: 'ai',
            content: aiResponse,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    const clearChat = () => {
        const welcome: ChatMessage[] = [{
            id: Date.now().toString(),
            role: 'ai',
            content: 'MEMORY CLEARED. AWAITING COMMANDS.',
            timestamp: Date.now()
        }];
        setMessages(welcome);
        localStorage.setItem('chat_history', '');
    };

    return (
        <>
            <motion.button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white z-50 border border-blue-400/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Bot size={24} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] glassmorphism-dark flex flex-col overflow-hidden z-50 border border-blue-500/20 shadow-2xl"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot className="text-blue-400" size={20} />
                                <span className="font-mono font-bold tracking-wider text-sm">A.I. SYSTEM</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={clearChat} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 pt-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                                            {msg.role === 'user' ? <User size={14} className="text-indigo-300" /> : <Bot size={14} className="text-blue-300" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600/40 text-indigo-50 rounded-tr-sm' : 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 p-3 bg-white/5 rounded-2xl rounded-tl-sm border border-white/5">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-black/20 border-t border-white/5">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask for system telemetry..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 font-sans text-slate-200 placeholder:text-slate-500 transition-colors"
                                />
                                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors">
                                    <Send size={14} className="text-white" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
