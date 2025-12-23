
import React, { useState } from 'react';
import { MockTest, Chapter, MasterMockTest, Question } from '../types';
import { Plus, Trash2, TrendingUp, Info, Sparkles, Loader2, X, BrainCircuit, BarChart, PlayCircle, Clock, BookOpen, Timer, Zap, ChevronDown, CheckSquare } from 'lucide-react';
import { analyzeMockPerformance, PerformanceAnalysis } from '../services/geminiService';
import MockDB from '../services/mockDb';
import ExamRunner from './ExamRunner';

interface MockTestsProps {
  tests: MockTest[];
  addTest: (test: MockTest) => void;
  removeTest: (id: string) => void;
}

const MockTests: React.FC<MockTestsProps> = ({ tests, addTest, removeTest }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeExam, setActiveExam] = useState<{mock: MasterMockTest, questions: Question[]} | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ id: string, report: PerformanceAnalysis } | null>(null);
  const [formData, setFormData] = useState({ name: '', physics: 0, chemistry: 0, maths: 0 });

  const globalQuestions = MockDB.questions.all();
  const masterMocks = MockDB.tests.getMasterMocks();

  const handleStartExam = (master: MasterMockTest) => {
    const mockQuestions = globalQuestions.filter(q => master.questionIds.includes(q.id));
    if (mockQuestions.length === 0) return alert("This mock has no questions available in the question bank yet.");
    setActiveExam({ mock: master, questions: mockQuestions });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const physics = Number(formData.physics) || 0;
    const chemistry = Number(formData.chemistry) || 0;
    const maths = Number(formData.maths) || 0;
    const totalScore = physics + chemistry + maths;

    const newTest: MockTest = {
      id: `man_${Date.now()}`,
      userId: MockDB.auth.user()?.id || '', 
      name: formData.name || "Offline Practice Mock",
      date: new Date().toLocaleDateString(),
      physicsScore: physics,
      chemistryScore: chemistry,
      mathsScore: maths,
      totalScore: totalScore,
      outOf: 300,
      timeTakenSeconds: 0, // Manual entries don't have precise timing
      isAutomated: false
    };

    addTest(newTest);
    setShowForm(false);
    setFormData({ name: '', physics: 0, chemistry: 0, maths: 0 });
  };

  const handleAnalyze = async (test: MockTest) => {
    setAnalyzingId(test.id);
    const result = await analyzeMockPerformance(test, MockDB.chapters.all());
    setAnalysisResult({ id: test.id, report: result });
    setAnalyzingId(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (activeExam) {
    return (
      <ExamRunner 
        mock={activeExam.mock}
        questions={activeExam.questions}
        onComplete={(result) => {
          addTest(result);
          setActiveExam(null);
        }}
        onCancel={() => setActiveExam(null)}
      />
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-2">Available Master Mocks</h2>
          <p className="text-sm text-slate-500">Official preparation tests from the question bank.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {masterMocks.map(master => (
            <div key={master.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border-l-4 border-l-indigo-600 group">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6"><BookOpen className="w-7 h-7" /></div>
                 <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Published Exam</div>
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">{master.name}</h3>
               <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                 <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {master.durationMinutes}m</span>
                 <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> {master.totalMarks} Marks</span>
               </div>
               <button onClick={() => handleStartExam(master)} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95"><PlayCircle className="w-5 h-5" /> START CBT EXAM</button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-2">Result History</h2><p className="text-sm text-slate-500">Detailed performance logs from past examinations.</p></div>
          <button onClick={() => setShowForm(!showForm)} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-widest px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">Offline Entry</button>
        </div>

        {showForm && (
          <div className="glass-card p-8 rounded-[2rem] shadow-xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-800">Offline Mock Logging</h3><button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2"><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Exam Name (e.g. FIITJEE AITS)" className="w-full px-5 py-3 border border-slate-200 rounded-xl outline-none" />
              <div className="grid grid-cols-3 gap-4">
                {['physics', 'chemistry', 'maths'].map(sub => (
                  <div key={sub} className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">{sub.substring(0,3)}</label>
                    <input type="number" value={(formData as any)[sub]} onChange={e => setFormData({...formData, [sub]: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-center font-bold" />
                  </div>
                ))}
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all">Save Result to Database</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {tests.map(test => (
            <div key={test.id} className="glass-card p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6 relative group bg-white hover:border-indigo-200 transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{test.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{test.date}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                       <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{test.isAutomated ? 'SYSTEM EVALUATED' : 'OFFLINE ENTRY'}</span>
                       {test.timeTakenSeconds ? (
                         <>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                             <Timer className="w-3 h-3" /> {formatSeconds(test.timeTakenSeconds)}
                           </span>
                         </>
                       ) : null}
                    </div>
                  </div>
                  <div className="text-right"><div className="text-3xl font-black text-indigo-600 leading-none">{test.totalScore}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ {test.outOf} MARKS</div></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Physics', score: test.physicsScore, color: 'bg-indigo-600' },
                    { label: 'Chemistry', score: test.chemistryScore, color: 'bg-emerald-600' },
                    { label: 'Maths', score: test.mathsScore, color: 'bg-amber-600' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between items-end mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{s.label}</span><span className="text-slate-800">{s.score}</span></div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${Math.max(0, (s.score/100)*100)}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleAnalyze(test)} className="flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                    {analyzingId === test.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Deep Analysis
                  </button>
                  <button onClick={() => removeTest(test.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                {analysisResult && analysisResult.id === test.id && (
                  <div className="mt-4 p-8 bg-slate-900 text-indigo-100 rounded-[2.5rem] border border-slate-800 text-sm animate-in slide-in-from-top-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BrainCircuit className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-black">
                            {analysisResult.report.persona.charAt(0)}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">Logic Assistant Engine</span>
                            <h5 className="text-xl font-bold text-white tracking-tight">{analysisResult.report.persona}</h5>
                          </div>
                        </div>
                        <X className="w-6 h-6 cursor-pointer text-slate-500 hover:text-white" onClick={() => setAnalysisResult(null)} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Subject Insight</label>
                              <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisResult.report.subjectInsights.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Accuracy</span>
                                 <span className="text-xl font-black text-emerald-400">{analysisResult.report.accuracy}%</span>
                              </div>
                              <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Speed</span>
                                 <span className="text-xs font-black text-indigo-400 truncate block">{analysisResult.report.speedRating}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Actionable Roadmap</label>
                           {analysisResult.report.recommendations.map((rec, i) => (
                             <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-300 font-medium">{rec}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MockTests;
