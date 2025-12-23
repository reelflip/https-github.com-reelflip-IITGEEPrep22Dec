
import React, { useState, useEffect } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { Chapter, ChapterStatus } from '../types';
import { BrainCircuit, Zap, Loader2, Calendar, Settings2, Coffee, Flame, ShieldCheck } from 'lucide-react';

interface AIPlannerProps {
  chapters: Chapter[];
}

const AIPlanner: React.FC<AIPlannerProps> = ({ chapters }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [weakAreas, setWeakAreas] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    const savedIntensity = localStorage.getItem('iitgeeprep_intensity');
    const savedWeakAreas = localStorage.getItem('iitgeeprep_weakareas');
    if (savedIntensity) setIntensity(savedIntensity as any);
    if (savedWeakAreas) setWeakAreas(savedWeakAreas);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    // Deterministic plan generation based on local confidence data
    const result = await generateStudyPlan(chapters, weakAreas.split(','), intensity);
    setTimeout(() => {
      setPlan(result);
      setLoading(false);
    }, 600);
  };

  const intensityConfig = {
    low: { label: 'Low', icon: Coffee, desc: '~4 hours/day' },
    medium: { label: 'Medium', icon: Zap, desc: '~8 hours/day' },
    high: { label: 'High', icon: Flame, desc: '12+ hours/day' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-lg border border-indigo-100 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BrainCircuit className="w-32 h-32 text-indigo-600" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            Study Strategist <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </h2>
          <p className="text-slate-500 mt-2 mb-10 text-lg">
            Our local logic engine creates precision 7-day roadmaps based on your performance metrics.
          </p>

          <div className="space-y-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Detected Target Chapters</label>
              <div className="flex flex-wrap gap-2">
                {chapters.filter(c => c.confidence < 70).slice(0, 5).map(c => (
                  <span key={c.id} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                    {c.name} • {c.confidence}% Conf.
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific Topics to Prioritize</label>
              <input
                type="text"
                placeholder="e.g. Rotational Mechanics, Ionic Equilibrium"
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Study Intensity Level</label>
              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const Icon = intensityConfig[level].icon;
                  return (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                        intensity === level 
                          ? 'border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-50' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${intensity === level ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="font-black uppercase text-[10px] tracking-widest text-slate-900">{intensityConfig[level].label}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{intensityConfig[level].desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              {loading ? 'Analyzing Local Data...' : 'Build Weekly Master Plan'}
            </button>
          </div>
        </div>
      </div>

      {plan && (
        <div className="glass-card p-10 rounded-[2.5rem] shadow-sm border border-slate-100 bg-white relative overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="prose prose-slate max-w-none prose-headings:text-indigo-600 prose-headings:font-black">
            {plan.split('\n').map((line, i) => {
              if (line.startsWith('#')) return <h3 key={i} className="text-xl font-bold mt-6 mb-4">{line.replace(/^#+\s/, '')}</h3>;
              if (line.trim().startsWith('-')) return <li key={i} className="ml-4">{line.trim().substring(1).trim()}</li>;
              return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlanner;
