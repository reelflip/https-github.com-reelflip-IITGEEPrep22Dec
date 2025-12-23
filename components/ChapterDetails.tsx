
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { Chapter, VideoLink, Question, ChapterStatus } from '../types';
import { Book, Video, ClipboardList, History, Plus, Trash2, X, ExternalLink, Play, Save, CheckCircle, BarChart3, Clock, TrendingUp, ChevronDown, ChevronRight, AlertCircle, Edit3, Trash } from 'lucide-react';

interface ChapterDetailsProps {
  chapter: Chapter;
  isAdmin: boolean;
  onUpdate: (updated: Chapter) => void;
  onClose: () => void;
}

const ChapterDetails: React.FC<ChapterDetailsProps> = ({ chapter, isAdmin, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'videos' | 'practice' | 'analytics'>('notes');
  const [editingNotes, setEditingNotes] = useState(chapter.notes || '');
  const [editingName, setEditingName] = useState(chapter.name);
  const [editingDesc, setEditingDesc] = useState(chapter.description || '');
  const [isStudying, setIsStudying] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Video addition state
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, total: number } | null>(null);

  useEffect(() => {
    // Fix: Await MockDB questions bank call
    const loadQuestions = async () => {
      const bank = await MockDB.questions.all();
      const relevant = bank.filter(q => q.chapterId === chapter.id);
      setQuizQuestions(relevant);
    };
    loadQuestions();
  }, [chapter.id]);

  useEffect(() => {
    if (isAdmin) return;
    setIsStudying(true);
    const interval = setInterval(() => {
      onUpdate({ ...chapter, timeSpentMinutes: (chapter.timeSpentMinutes || 0) + 1 });
    }, 60000);
    return () => {
      clearInterval(interval);
      setIsStudying(false);
    };
  }, [isAdmin, chapter.id, onUpdate, chapter]);

  const handleStatusChange = (status: ChapterStatus) => {
    onUpdate({ ...chapter, status });
    setShowStatusMenu(false);
  };

  const handleGeneralUpdate = () => {
    onUpdate({ 
      ...chapter, 
      name: editingName, 
      description: editingDesc,
      notes: editingNotes 
    });
  };

  const addVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle || !newVideoUrl) return;
    const updatedVideos = [...chapter.videoLinks, { id: `v_${Date.now()}`, title: newVideoTitle, url: newVideoUrl }];
    onUpdate({ ...chapter, videoLinks: updatedVideos });
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const removeVideo = (videoId: string) => {
    const updatedVideos = chapter.videoLinks.filter(v => v.id !== videoId);
    onUpdate({ ...chapter, videoLinks: updatedVideos });
  };

  const simulateVideoWatch = (minutes: number) => {
    onUpdate({ ...chapter, videosWatchedMinutes: (chapter.videosWatchedMinutes || 0) + minutes });
  };

  const startQuiz = () => {
    if (quizQuestions.length === 0) return;
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });

    const result = { score, total: quizQuestions.length };
    setQuizResult(result);
    setCurrentQuizIdx(null);

    // Save attempt to DB
    const attempt = { id: `att_${Date.now()}`, date: new Date().toLocaleDateString(), score, total: result.total };
    onUpdate({
      ...chapter,
      attempts: [...(chapter.attempts || []), attempt],
      questionsSolvedCount: (chapter.questionsSolvedCount || 0) + result.total,
      confidence: Math.min(100, Math.floor(((chapter.confidence || 0) + (score/result.total * 15))))
    });
  };

  const getStatusColor = (status: ChapterStatus) => {
    switch (status) {
      case ChapterStatus.COMPLETED: return 'bg-emerald-500 text-white';
      case ChapterStatus.IN_PROGRESS: return 'bg-blue-500 text-white';
      case ChapterStatus.REVISION_NEEDED: return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
              <Book className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-indigo-500 rounded text-[10px] font-black uppercase tracking-tighter">
                  {chapter.subject}
                </span>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all hover:ring-2 hover:ring-white/20 ${getStatusColor(chapter.status)}`}
                  >
                    {chapter.status}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {Object.values(ChapterStatus).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 ${chapter.status === status ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isStudying && !isAdmin && (
                   <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold animate-pulse">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                     FOCUSED STUDY SESSION
                   </span>
                )}
              </div>
              
              {isAdmin ? (
                <div className="space-y-2 mt-2">
                  <input 
                    value={editingName} 
                    onChange={e => setEditingName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-2xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Chapter Name"
                  />
                  <input 
                    value={editingDesc} 
                    onChange={e => setEditingDesc(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-80"
                    placeholder="Short description / Summary..."
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold tracking-tight">{chapter.name}</h3>
                  <p className="text-sm opacity-60 line-clamp-1">{chapter.description || 'No description available for this chapter.'}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={handleGeneralUpdate}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save All Changes
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-50 border-b border-slate-100 px-8">
          {[
            { id: 'notes', label: 'Study Notes', icon: Book },
            { id: 'videos', label: 'Watch Tutorials', icon: Video },
            { id: 'practice', label: 'Practice Quiz', icon: ClipboardList },
            { id: 'analytics', label: 'Learning Stats', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-5 px-8 flex items-center gap-3 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white" onClick={() => setShowStatusMenu(false)}>
          {activeTab === 'notes' && (
            <div className="max-w-3xl mx-auto space-y-6">
               <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold text-slate-800">Conceptual Summary</h4>
               </div>
               {isAdmin ? (
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports Markdown-like plain text</p>
                    <textarea 
                      value={editingNotes} 
                      onChange={e => setEditingNotes(e.target.value)} 
                      className="w-full h-96 p-6 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 outline-none font-mono text-sm leading-relaxed" 
                      placeholder="Write comprehensive chapter notes here..."
                    />
                 </div>
               ) : (
                 <div className="prose prose-indigo max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {chapter.notes || "This chapter template is currently empty. Use the Study Planner or Mentor to populate insights."}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapter.videoLinks.map(video => (
                  <div key={video.id} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:rotate-6 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex gap-2">
                        {!isAdmin && (
                          <button onClick={() => simulateVideoWatch(10)} className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                            LOG 10 MINS
                          </button>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => removeVideo(video.id)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h5 className="font-bold text-slate-800 mb-1">{video.title}</h5>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-mono">
                      {video.url.substring(0, 30)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="glass-card p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <h5 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                    <Plus className="w-4 h-4" /> Append New Lecture Link
                  </h5>
                  <form onSubmit={addVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      value={newVideoTitle}
                      onChange={e => setNewVideoTitle(e.target.value)}
                      placeholder="Video Title (e.g. Concept Part 1)"
                      className="px-5 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      <input 
                        required
                        value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)}
                        placeholder="YouTube/Vimeo URL"
                        className="flex-1 px-5 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">
                        ADD
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="max-w-2xl mx-auto py-4">
               {currentQuizIdx === null && !quizResult ? (
                 <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <ClipboardList className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 tracking-tight">Practice Session</h4>
                      <p className="text-slate-500 mt-2">There are {quizQuestions.length} questions available for this chapter in the bank.</p>
                    </div>
                    <button 
                      onClick={startQuiz}
                      disabled={quizQuestions.length === 0}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30 flex items-center gap-3 mx-auto"
                    >
                      Start Practicing <ChevronRight className="w-5 h-5" />
                    </button>
                    {quizQuestions.length === 0 && (
                      <div className="flex items-center gap-2 justify-center text-rose-500 font-bold text-xs bg-rose-50 p-4 rounded-2xl border border-rose-100">
                        <AlertCircle className="w-4 h-4" /> No questions tagged for this chapter in the Admin bank.
                      </div>
                    )}
                 </div>
               ) : currentQuizIdx !== null ? (
                 <div className="space-y-8 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <span>Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
                       <span>Correct: +4 | Wrong: -0</span>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-lg font-medium text-slate-800 leading-relaxed mb-6">{quizQuestions[currentQuizIdx].text}</p>
                      <div className="grid grid-cols-1 gap-3">
                        {quizQuestions[currentQuizIdx].options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setQuizAnswers({...quizAnswers, [currentQuizIdx]: i})}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              quizAnswers[currentQuizIdx] === i 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md' 
                                : 'border-white bg-white hover:border-slate-200'
                            }`}
                          >
                            <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                       <button 
                        disabled={currentQuizIdx === 0}
                        onClick={() => setCurrentQuizIdx(currentQuizIdx - 1)}
                        className="text-slate-400 font-bold hover:text-slate-800 disabled:opacity-20"
                       >
                         Previous
                       </button>
                       {currentQuizIdx === quizQuestions.length - 1 ? (
                         <button onClick={handleQuizSubmit} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700">Submit Quiz</button>
                       ) : (
                         <button onClick={() => setCurrentQuizIdx(currentQuizIdx + 1)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Next Question</button>
                       )}
                    </div>
                 </div>
               ) : quizResult ? (
                 <div className="text-center space-y-8 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800">Session Complete!</h4>
                    <p className="text-4xl font-black text-indigo-600">{quizResult.score} / {quizResult.total}</p>
                    <p className="text-slate-500">Your confidence in this chapter has been synchronized.</p>
                    <button onClick={() => setQuizResult(null)} className="px-8 py-3 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50">Back to Practice</button>
                 </div>
               ) : null}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                     <div className="flex items-center gap-3 text-indigo-600 mb-3">
                        <Clock className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Focus Time</span>
                     </div>
                     <p className="text-4xl font-black text-slate-900">{Math.floor(chapter.timeSpentMinutes || 0)}<span className="text-xl ml-1 text-slate-400 font-medium">m</span></p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                     <div className="flex items-center gap-3 text-blue-600 mb-3">
                        <Video className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Video Intake</span>
                     </div>
                     <p className="text-4xl font-black text-slate-900">{Math.floor(chapter.videosWatchedMinutes || 0)}<span className="text-xl ml-1 text-slate-400 font-medium">m</span></p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                     <div className="flex items-center gap-3 text-emerald-600 mb-3">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Mastery Level</span>
                     </div>
                     <p className="text-4xl font-black text-slate-900">{chapter.confidence || 0}<span className="text-xl ml-1 text-slate-400 font-medium">%</span></p>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10">
                    <History className="w-48 h-48 -mr-10 -mt-10" />
                  </div>
                  <h5 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10">
                    <TrendingUp className="text-indigo-400" /> Recent Progress
                  </h5>
                  {chapter.attempts && chapter.attempts.length > 0 ? (
                    <div className="space-y-3 relative z-10">
                       {chapter.attempts.slice().reverse().slice(0, 5).map(attempt => (
                         <div key={attempt.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <div>
                               <p className="font-bold text-sm">{attempt.score} / {attempt.total} Score</p>
                               <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">{attempt.date}</p>
                            </div>
                            <div className="px-3 py-1 bg-indigo-600/50 rounded-lg text-xs font-black border border-indigo-400/30">
                               {Math.round((attempt.score/attempt.total)*100)}%
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic relative z-10">No practice attempts recorded for this chapter yet.</p>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterDetails;
