
import React, { useState } from 'react';
import { Chapter, ChapterStatus, Subject } from '../types';
import { Search, BookOpen, Clock, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';
import ChapterDetails from './ChapterDetails';

interface SubjectTrackerProps {
  chapters: Chapter[];
  updateChapter: (updatedChapter: Chapter) => void;
  isAdmin?: boolean;
}

const SubjectTracker: React.FC<SubjectTrackerProps> = ({ chapters, updateChapter, isAdmin = false }) => {
  const [activeSubject, setActiveSubject] = useState<Subject>('Physics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const filteredChapters = chapters.filter(c => 
    c.subject === activeSubject && 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: ChapterStatus) => {
    switch (status) {
      case ChapterStatus.COMPLETED: return <CheckCircle className="text-emerald-500 w-5 h-5" />;
      case ChapterStatus.IN_PROGRESS: return <Clock className="text-blue-500 w-5 h-5" />;
      case ChapterStatus.REVISION_NEEDED: return <RotateCcw className="text-amber-500 w-5 h-5" />;
      default: return <BookOpen className="text-slate-300 w-5 h-5" />;
    }
  };

  const cycleStatus = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    const statuses = Object.values(ChapterStatus);
    const currentIndex = statuses.indexOf(chapter.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateChapter({ ...chapter, status: nextStatus });
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {(['Physics', 'Chemistry', 'Mathematics'] as Subject[]).map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className={`px-6 py-2 rounded-lg transition-all font-medium ${
                activeSubject === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map(chapter => (
          <div 
            key={chapter.id} 
            onClick={() => handleChapterClick(chapter)}
            className="glass-card p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-400 cursor-pointer transition-all group hover:translate-y-[-2px]"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-slate-800 leading-tight pr-4">{chapter.name}</h4>
              <button 
                onClick={(e) => cycleStatus(chapter, e)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                {getStatusIcon(chapter.status)}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <span>Confidence: {chapter.confidence}%</span>
                <span className="flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                   Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${chapter.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedChapter && (
        <ChapterDetails 
          chapter={selectedChapter}
          isAdmin={isAdmin}
          onUpdate={(updated) => {
            updateChapter(updated);
            setSelectedChapter(updated);
          }}
          onClose={() => setSelectedChapter(null)}
        />
      )}
    </div>
  );
};

export default SubjectTracker;
