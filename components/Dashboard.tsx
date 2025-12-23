
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Chapter, ChapterStatus, MockTest } from '../types';
import { Activity, Target, CheckCircle2, Clock, Video, BrainCircuit, BarChart3 } from 'lucide-react';

interface DashboardProps {
  chapters: Chapter[];
  mockTests: MockTest[];
}

const Dashboard: React.FC<DashboardProps> = ({ chapters, mockTests }) => {
  const completedChapters = chapters.filter(c => c.status === ChapterStatus.COMPLETED).length;
  const progressPercent = Math.round((completedChapters / chapters.length) * 100);
  
  // Aggregate Analytics from DB
  const totalTimeSpent = Math.floor(chapters.reduce((acc, c) => acc + (c.timeSpentMinutes || 0), 0));
  const totalVideoMinutes = Math.floor(chapters.reduce((acc, c) => acc + (c.videosWatchedMinutes || 0), 0));
  const totalSolved = chapters.reduce((acc, c) => acc + (c.questionsSolvedCount || 0), 0);

  const subjectProgress = ['Physics', 'Chemistry', 'Mathematics'].map(subject => {
    const total = chapters.filter(c => c.subject === subject).length;
    const completed = chapters.filter(c => c.subject === subject && c.status === ChapterStatus.COMPLETED).length;
    return { name: subject, value: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  const chartData = [
    { name: 'Completed', value: completedChapters, color: '#4f46e5' },
    { name: 'Remaining', value: Math.max(0, chapters.length - completedChapters), color: '#f1f5f9' },
  ];

  // Subject-wise Mock Averages (Out of 100 per subject)
  const avgPhysics = mockTests.length > 0 ? Math.round(mockTests.reduce((acc, t) => acc + t.physicsScore, 0) / mockTests.length) : 0;
  const avgChemistry = mockTests.length > 0 ? Math.round(mockTests.reduce((acc, t) => acc + t.chemistryScore, 0) / mockTests.length) : 0;
  const avgMaths = mockTests.length > 0 ? Math.round(mockTests.reduce((acc, t) => acc + t.mathsScore, 0) / mockTests.length) : 0;

  const mockAverages = [
    { subject: 'Physics', score: avgPhysics, color: '#4f46e5' },
    { subject: 'Chemistry', score: avgChemistry, color: '#10b981' },
    { subject: 'Maths', score: avgMaths, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back, Aspirant!</h2>
        <span className="text-slate-500 text-sm font-medium">Target: IIT JEE 2025</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${progressPercent}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Total Study Time', value: `${totalTimeSpent}m`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Questions Solved', value: totalSolved, icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Mock Avg (300)', value: avgPhysics + avgChemistry + avgMaths, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-100' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{stat.label}</span>
              <stat.icon className={`${stat.color} ${stat.bg} p-2 rounded-lg w-10 h-10`} />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Breakdown */}
        <div className="glass-card p-8 rounded-3xl shadow-sm border border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-indigo-600">{progressPercent}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Done</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-4">Syllabus Mastery</h3>
            {subjectProgress.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{s.name}</span>
                  <span className="text-slate-900 font-black">{s.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      s.name === 'Physics' ? 'bg-indigo-500' : s.name === 'Chemistry' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} 
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Subject Performance */}
        <div className="glass-card p-8 rounded-3xl shadow-sm border border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Subject Strengths</h3>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest">MOCK AVG (OUT OF 100)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAverages} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={12} width={80} tick={{ fontWeight: 'bold' }} />
                <Tooltip 
                   cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                  {mockAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full Syllabus Analytics */}
      <div className="glass-card p-8 rounded-3xl shadow-sm border border-slate-100 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Performance Curve</h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-400">PHY</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-400">CHE</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-400">MAT</span></div>
          </div>
        </div>
        {mockTests.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTests}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 300]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="physicsScore" name="Physics" fill="#4f46e5" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="chemistryScore" name="Chemistry" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mathsScore" name="Maths" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-300 italic font-medium flex flex-col items-center gap-4">
            <Activity className="w-12 h-12 opacity-20" />
            <p>Take your first mock test to see your performance curve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
