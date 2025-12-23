
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { Users, BookOpen, BarChart2, ShieldCheck, Plus, ListFilter, ClipboardCheck, Database, Zap, Cpu, Search, Trash2, Tag, CheckCircle, Clock, Save, FilePlus, BrainCircuit, Activity, LineChart as LucideLineChart, MousePointer2 } from 'lucide-react';
import { Subject, ChapterStatus, Question, MasterMockTest, AIModelConfig } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import SubjectTracker from './SubjectTracker';

const AI_MODELS: AIModelConfig[] = [
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', tag: 'SPEED', description: 'Ultra-fast, optimized for quick doubts and scheduling.', type: 'speed', internalId: 'gemini-3-flash-preview' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', tag: 'REASONING', description: 'Deep reasoning and complex Physics problem solving.', type: 'reasoning', internalId: 'gemini-3-pro-preview' },
  { id: 'llama-3-1', name: 'Llama 3.1 (70B)', tag: 'GENERAL', description: 'Versatile model with great theory explanation capabilities.', type: 'general', internalId: 'gemini-3-flash-preview' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', tag: 'LOGIC', description: 'Logic-heavy model, excellent for Inorganic Chemistry facts.', type: 'logic', internalId: 'gemini-3-pro-preview' },
  { id: 'qwen-math', name: 'Qwen 2.5 Math', tag: 'MATH', description: 'Specialized for high-level Mathematics and Calculus.', type: 'math', internalId: 'gemini-3-pro-preview' },
  { id: 'mistral-large', name: 'Mistral Large', tag: 'BALANCED', description: 'Balanced performance for general guidance and motivation.', type: 'balanced', internalId: 'gemini-3-pro-preview' },
];

const AdminPanel: React.FC = () => {
  const students = MockDB.admin.getAllUsers();
  const stats = MockDB.admin.getSystemStats();
  const [activeTab, setActiveTab] = useState<'users' | 'curriculum' | 'questions' | 'constructor' | 'ai-config'>('users');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(MockDB.config.get());

  const refreshPanel = () => {
    setQuestions(MockDB.questions.all());
    setChapters(MockDB.chapters.all());
    setSystemConfig(MockDB.config.get());
  };

  useEffect(() => {
    refreshPanel();
  }, []);

  // --- Curriculum State ---
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ name: '', subject: 'Physics' as Subject });

  // --- Question Bank State ---
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qForm, setQForm] = useState<Omit<Question, 'id'>>({
    subject: 'Physics',
    chapterId: '',
    examTag: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  // --- Mock Constructor State ---
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set());
  const [mockName, setMockName] = useState('');
  const [mockDuration, setMockDuration] = useState(180);

  const handleModelChange = (id: string) => {
    MockDB.config.set({ activeModelId: id });
    refreshPanel();
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.name) return;
    MockDB.chapters.add({
      name: newChapter.name,
      subject: newChapter.subject,
      status: ChapterStatus.NOT_STARTED,
      confidence: 0,
      videoLinks: [],
      questions: [],
      attempts: [],
      notes: '',
      timeSpentMinutes: 0,
      videosWatchedMinutes: 0,
      questionsSolvedCount: 0
    });
    setShowAddChapter(false);
    setNewChapter({ name: '', subject: 'Physics' });
    refreshPanel();
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    MockDB.questions.add(qForm);
    setShowAddQuestion(false);
    setQForm({
      subject: 'Physics',
      chapterId: '',
      examTag: '',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    refreshPanel();
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      MockDB.questions.delete(id);
      refreshPanel();
    }
  };

  const handleCreateMock = () => {
    if (!mockName || selectedQIds.size === 0) {
      alert("Please provide a name and select at least one question.");
      return;
    }
    const newMock: MasterMockTest = {
      id: `mock_${Date.now()}`,
      name: mockName,
      durationMinutes: mockDuration,
      totalMarks: selectedQIds.size * 4,
      questionIds: Array.from(selectedQIds)
    };
    MockDB.tests.addMasterMock(newMock);
    setMockName('');
    setSelectedQIds(new Set());
    setActiveTab('users');
    alert("Master Mock Test created and published to students!");
  };

  const toggleQSelection = (id: string) => {
    const next = new Set(selectedQIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQIds(next);
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'speed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'reasoning': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'general': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'logic': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'math': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'balanced': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">System Infrastructure</h2>
          <p className="text-slate-500">Global Question Bank & AI Model Orchestration.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          Administrator Console
        </div>
      </div>

      {/* Admin Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Question Bank', value: stats.totalQuestions, icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Mock Attempts', value: stats.totalTestsTaken, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'DB Storage', value: stats.dbSize, icon: Database, color: 'text-rose-600', bg: 'bg-rose-100' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl shadow-sm border border-slate-100 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-4 p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm overflow-x-auto max-w-full">
        {[
          { id: 'users', label: 'Student Registry' },
          { id: 'curriculum', label: 'Curriculum' },
          { id: 'questions', label: 'Question Bank' },
          { id: 'constructor', label: 'Mock Constructor' },
          { id: 'ai-config', label: 'AI Infrastructure' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: AI Infrastructure */}
      {activeTab === 'ai-config' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                Select Primary Intelligence Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all hover:shadow-lg ${
                      systemConfig.activeModelId === model.id 
                        ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-50' 
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-widest border mb-3 ${getTagColor(model.type)}`}>
                      {model.tag}
                    </div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{model.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Model Accuracy & Health
              </h3>
              <div className="glass-card p-8 rounded-[2rem] border border-slate-100 bg-white h-full flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-2xl font-black text-slate-900">92.4%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Inference Accuracy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">0.8s</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Latency</p>
                  </div>
                </div>
                
                <div className="flex-1 h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={systemConfig.modelMetrics}>
                        <defs>
                          <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[80, 100]} hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Cpu className="w-3 h-3" /> TPU Node: US-EAST-1
                   </span>
                   <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                     Run Stress Test
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Question Bank */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Centralized Question Pool
            </h3>
            <button 
              onClick={() => setShowAddQuestion(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Question
            </button>
          </div>

          <div className="glass-card rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Subject</th>
                    <th className="px-8 py-5">Question Content</th>
                    <th className="px-8 py-5">Tagging</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {questions.length > 0 ? questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          q.subject === 'Physics' ? 'bg-indigo-100 text-indigo-600' : 
                          q.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-8 py-5 max-w-md">
                        <p className="text-slate-800 text-sm line-clamp-2 leading-relaxed">{q.text}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          {q.chapterId ? (
                             <span className="text-[10px] text-slate-500 flex items-center gap-1">
                               <BookOpen className="w-3 h-3" /> {chapters.find(c => c.id === q.chapterId)?.name || 'Unknown Chapter'}
                             </span>
                          ) : (
                             <span className="text-[10px] text-slate-400 italic">No Chapter Tag</span>
                          )}
                          {q.examTag && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {q.examTag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                        No questions in the bank. Add some to build mock tests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs follow original logic */}
      {activeTab === 'constructor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FilePlus className="text-indigo-600 w-5 h-5" /> Test Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mock Name</label>
                  <input 
                    type="text"
                    value={mockName}
                    onChange={e => setMockName(e.target.value)}
                    placeholder="e.g. Full Syllabus Mock #2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      value={mockDuration}
                      onChange={e => setMockDuration(parseInt(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-indigo-700 mb-2">
                    <span>Selected</span>
                    <span>{selectedQIds.size} Questions</span>
                  </div>
                  <div className="h-1.5 w-full bg-indigo-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (selectedQIds.size / 30) * 100)}%` }} />
                  </div>
                </div>

                <button 
                  onClick={handleCreateMock}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save & Publish Mock
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {questions.map((q) => (
                  <button 
                    key={q.id}
                    onClick={() => toggleQSelection(q.id)}
                    className={`w-full text-left p-5 rounded-3xl border-2 transition-all group flex items-start gap-4 ${
                      selectedQIds.has(q.id) 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                        : 'border-slate-50 bg-white hover:border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${
                      selectedQIds.has(q.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {selectedQIds.has(q.id) && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 leading-relaxed">{q.text}</p>
                    </div>
                  </button>
                ))}
              </div>
          </div>
        </div>
      )}

      {/* Tab Content: Student Registry */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{student.email}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Curriculum Logic */}
      {activeTab === 'curriculum' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <SubjectTracker 
               chapters={MockDB.chapters.all()} 
               updateChapter={(updated) => { MockDB.chapters.update(updated.id, updated); refreshPanel(); }}
               isAdmin={true}
             />
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <FilePlus className="text-indigo-400" /> New Question Entry
              </h3>
              <button onClick={() => setShowAddQuestion(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select 
                    value={qForm.subject}
                    onChange={e => setQForm({...qForm, subject: e.target.value as Subject})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  >
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Tag (Optional)</label>
                  <input 
                    type="text"
                    value={qForm.examTag}
                    onChange={e => setQForm({...qForm, examTag: e.target.value})}
                    placeholder="e.g. JEE Main 2024"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chapter Tag</label>
                <select 
                  value={qForm.chapterId}
                  onChange={e => setQForm({...qForm, chapterId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
                >
                  <option value="">Untagged (General)</option>
                  {chapters.filter(c => c.subject === qForm.subject).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Text</label>
                <textarea 
                  required
                  rows={3}
                  value={qForm.text}
                  onChange={e => setQForm({...qForm, text: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed"
                  placeholder="Paste question content here..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Options & Correct Answer</label>
                {qForm.options.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <input 
                      required
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...qForm.options];
                        newOpts[i] = e.target.value;
                        setQForm({...qForm, options: newOpts});
                      }}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setQForm({...qForm, correctAnswer: i})}
                      className={`px-4 py-3 rounded-xl font-black text-xs transition-all border-2 ${
                        qForm.correctAnswer === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      CORRECT
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Add to Bank
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default AdminPanel;
