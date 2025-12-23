
import React, { useState, useRef, useEffect } from 'react';
import { getMentorAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, ShieldCheck } from 'lucide-react';

const AIMentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const advice = await getMentorAdvice(messages, userMsg);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'model', content: advice }]);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col glass-card rounded-2xl shadow-xl border border-slate-200 overflow-hidden bg-white">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">Private Coach</h3>
            <p className="text-xs opacity-80">Local Smart Logic v1.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
           <ShieldCheck className="w-3.5 h-3.5" />
           <span className="text-[10px] font-black uppercase tracking-widest">Privacy Guard On</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <Bot className="w-16 h-16 text-indigo-100" />
            <p className="text-slate-400 max-w-sm">
              I'm your local prep coach. I can help with subject-wise strategies, time management, and mock test analysis.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Physics tips", "Chemistry strategy", "Revision roadmap"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-indigo-50 transition-all">{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in zoom-in-95`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-indigo-600" /><span className="text-sm text-slate-400">Processing...</span></div></div>}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
