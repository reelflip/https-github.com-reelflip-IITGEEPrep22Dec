
import React, { useState, useEffect, useRef } from 'react';
import { MasterMockTest, Question, MockTest } from '../types';
import { Clock, ChevronRight, ChevronLeft, Flag, CheckCircle, AlertCircle, LayoutGrid, X, LogOut } from 'lucide-react';

interface ExamRunnerProps {
  mock: MasterMockTest;
  questions: Question[];
  onComplete: (result: MockTest) => void;
  onCancel: () => void;
}

const ExamRunner: React.FC<ExamRunnerProps> = ({ mock, questions, onComplete, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(mock.durationMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleFlag = (qId: string) => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(qId)) newFlagged.delete(qId);
    else newFlagged.add(qId);
    setFlagged(newFlagged);
  };

  const handleSubmit = () => {
    let pScore = 0, cScore = 0, mScore = 0;
    const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    questions.forEach(q => {
      const userAns = answers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      const points = userAns === undefined ? 0 : (isCorrect ? 4 : -1);

      if (q.subject === 'Physics') pScore += points;
      if (q.subject === 'Chemistry') cScore += points;
      if (q.subject === 'Mathematics') mScore += points;
    });

    const result: MockTest = {
      id: `res_${Date.now()}`,
      userId: '',
      name: mock.name,
      date: new Date().toLocaleDateString(),
      physicsScore: pScore,
      chemistryScore: cScore,
      mathsScore: mScore,
      totalScore: pScore + cScore + mScore,
      outOf: mock.totalMarks,
      timeTakenSeconds: timeTakenSeconds,
      isAutomated: true
    };

    onComplete(result);
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[100] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4 max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold">Incomplete Configuration</h3>
          <p className="text-slate-500 text-sm">This test contains no questions. Please inform your administrator.</p>
          <button onClick={onCancel} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col font-sans animate-in slide-in-from-top duration-500">
      <header className="h-16 bg-slate-900 text-white px-8 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">JEE COMPUTER BASED MODE</div>
          <h2 className="font-bold text-sm tracking-tight">{mock.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5 font-mono">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className={timeLeft < 600 ? 'text-rose-400 animate-pulse font-bold' : ''}>{formatTime(timeLeft)}</span>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2"></div>
          <button 
            onClick={() => setShowConfirm(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-1.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/20"
          >
            Submit Paper
          </button>
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
               <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded">
                      {currentQ.subject}
                    </span>
                 </div>
                 <p className="text-xl font-medium text-slate-800 leading-relaxed pt-2">
                   {currentQ.text}
                 </p>
               </div>
               <button onClick={() => toggleFlag(currentQ.id)} className={`p-2 rounded-lg transition-colors shrink-0 ml-4 ${flagged.has(currentQ.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:text-slate-500'}`}>
                 <Flag className={`w-6 h-6 ${flagged.has(currentQ.id) ? 'fill-current' : ''}`} />
               </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(currentQ.id, i)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    answers[currentQ.id] === i 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 border-2 ${
                    answers[currentQ.id] === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`font-medium ${answers[currentQ.id] === i ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-10 border-t border-slate-100">
               <button 
                 disabled={currentIdx === 0}
                 onClick={() => setCurrentIdx(prev => prev - 1)}
                 className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
               >
                 <ChevronLeft className="w-5 h-5" /> Previous
               </button>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setAnswers(prev => {
                     const n = {...prev};
                     delete n[currentQ.id];
                     return n;
                   })}
                   className="px-6 py-3 border border-slate-200 rounded-xl text-slate-400 font-bold hover:text-rose-500 hover:border-rose-200"
                 >
                   Clear Selection
                 </button>
                 <button 
                   onClick={() => {
                     if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
                     else setShowConfirm(true);
                   }}
                   className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black"
                 >
                   {currentIdx === questions.length - 1 ? 'Finish Section' : 'Save & Next'} <ChevronRight className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        <aside className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <LayoutGrid className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-bold text-slate-800 leading-none">Question Palette</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Full Section Pool</p>
             </div>
          </div>

          <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[40vh] mb-6 p-1 custom-scrollbar">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-full aspect-square rounded-lg text-xs font-black border-2 transition-all flex items-center justify-center relative ${
                  currentIdx === i ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                } ${
                  flagged.has(q.id) ? 'bg-amber-400 border-amber-400 text-white' :
                  answers[q.id] !== undefined ? 'bg-emerald-500 border-emerald-500 text-white' :
                  'bg-white border-slate-200 text-slate-400 hover:border-indigo-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
               <div className="w-4 h-4 bg-emerald-500 rounded"></div> <span>Answered ({Object.keys(answers).length})</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
               <div className="w-4 h-4 bg-amber-400 rounded"></div> <span>Flagged ({flagged.size})</span>
            </div>
            
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-white hover:text-slate-600 transition-all"
            >
              <AlertCircle className="w-4 h-4" /> Instructions
            </button>
          </div>
        </aside>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
               <CheckCircle className="w-10 h-10" />
             </div>
             <div>
               <h3 className="text-2xl font-bold text-slate-800">Final Submission</h3>
               <p className="text-slate-500 mt-2">You have answered {Object.keys(answers).length} questions out of {questions.length}. Are you sure you want to end the test?</p>
             </div>
             <div className="flex flex-col gap-3">
               <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                 Yes, Submit Test
               </button>
               <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">
                 Wait, Let me Review
               </button>
             </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
               <LogOut className="w-10 h-10" />
             </div>
             <div>
               <h3 className="text-2xl font-bold text-slate-800">Exit without attempt?</h3>
               <p className="text-slate-500 mt-2">Any progress in this session will be discarded. No score will be recorded in your history.</p>
             </div>
             <div className="flex flex-col gap-3">
               <button onClick={onCancel} className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                 Confirm Exit
               </button>
               <button onClick={() => setShowExitConfirm(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">
                 Resume Test
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRunner;
