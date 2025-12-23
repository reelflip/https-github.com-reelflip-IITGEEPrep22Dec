
import React from 'react';
import { GraduationCap, Target, ShieldCheck, Zap, Heart, Users } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-2">
          <GraduationCap className="text-white w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">About iitgeeprep</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          We are dedicated to building the world's most intelligent preparation ecosystem for IIT JEE aspirants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white hover:shadow-xl transition-all">
          <Target className="w-10 h-10 text-indigo-600 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-4">Our Mission</h3>
          <p className="text-slate-600 leading-relaxed">
            Cracking JEE requires more than just hard work; it requires precision. iitgeeprep bridges the gap between effort and results through data-driven tracking and AI-powered mentorship.
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white hover:shadow-xl transition-all">
          <Zap className="w-10 h-10 text-amber-500 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-4">The iitgeeprep Edge</h3>
          <p className="text-slate-600 leading-relaxed">
            By leveraging Google Gemini's advanced reasoning, we provide students with instant doubt clearance and personalized study schedules that adapt to their real-time performance.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Users className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Built for Students, by Engineers <Heart className="text-rose-500 fill-current w-6 h-6" />
          </h3>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-2xl">
            Our team consists of IIT alumni and software engineers who understand the pressure of the JEE journey. Every feature in iitgeeprep is designed to reduce cognitive load and maximize focus.
          </p>
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div>
              <p className="text-3xl font-black text-white">50k+</p>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Questions Logged</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Syllabus Covered</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">24/7</p>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">AI Support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">iitgeeprep • Version 1.2 • Distributed via PHP Laravel Bridge</p>
      </div>
    </div>
  );
};

export default AboutUs;
