
import React, { useState } from 'react';
import { Code, Server, Database, Lock, Shield, Rocket, Copy, Terminal, CheckCircle2, Globe, FileCode, Route } from 'lucide-react';

const LaravelReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'logic' | 'sql' | 'deploy'>('logic');

  const logicSnippets = [
    {
      title: 'Routes: api.php',
      icon: Route,
      code: `// routes/api.php
use App\Http\Controllers\ChapterContentController;

Route::middleware(['auth', 'admin'])->group(function () {
    // Admin only routes for content creation
    Route::post('/chapters/{chapter}/videos', [ChapterContentController::class, 'addVideo']);
    Route::post('/chapters/{chapter}/questions', [ChapterContentController::class, 'addQuestion']);
    Route::patch('/chapters/{chapter}/notes', [ChapterContentController::class, 'updateNotes']);
});

Route::middleware('auth')->group(function () {
    // Student routes for progress and tests
    Route::post('/chapters/{chapter}/attempts', [ChapterContentController::class, 'recordAttempt']);
});`
    },
    {
      title: 'Model: Chapter.php',
      icon: FileCode,
      code: `// app/Models/Chapter.php
namespace App\Models;

class Chapter extends Model {
    protected $fillable = ['name', 'subject', 'notes', 'user_id'];

    public function videos() {
        return $this->hasMany(ChapterVideo::class);
    }

    public function questions() {
        return $this->hasMany(ChapterQuestion::class);
    }

    public function attempts() {
        return $this->hasMany(TestAttempt::class);
    }
}`
    },
    {
      title: 'Controller: ContentController.php',
      icon: Lock,
      code: `// app/Http/Controllers/ChapterContentController.php
public function updateNotes(Request $request, Chapter $chapter) {
    $this->authorize('update', $chapter);
    $chapter->update(['notes' => $request->notes]);
    return response()->json(['message' => 'Notes saved!']);
}

public function addVideo(Request $request, Chapter $chapter) {
    $video = $chapter->videos()->create($request->all());
    return response()->json($video);
}`
    }
  ];

  const sqlScript = `
-- 1. Base Users & Auth
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') DEFAULT 'student',
    created_at TIMESTAMP NULL
) ENGINE=InnoDB;

-- 2. Expanded Chapters Table
CREATE TABLE chapters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL, -- NULL for template chapters
    name VARCHAR(255) NOT NULL,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    status VARCHAR(50) DEFAULT 'Not Started',
    confidence INT DEFAULT 0,
    notes TEXT NULL,
    created_at TIMESTAMP NULL
) ENGINE=InnoDB;

-- 3. Chapter Resources (Videos)
CREATE TABLE chapter_videos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Practice Questions
CREATE TABLE chapter_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL, -- Array of strings
    correct_answer_index INT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Test History
CREATE TABLE test_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    chapter_id BIGINT UNSIGNED NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
) ENGINE=InnoDB;
`;

  const deploymentSteps = [
    { 
      title: 'Local Preparation', 
      desc: 'Run "composer install --no-dev" and "npm run build" on your PC. Zip the entire folder EXCEPT node_modules.', 
      icon: Terminal 
    },
    { 
      title: 'Database Setup', 
      desc: 'Go to Hostinger hPanel -> MySQL Databases. Create a DB/User, then use phpMyAdmin to import the SQL script provided here.', 
      icon: Database 
    },
    { 
      title: 'Upload via File Manager', 
      desc: 'Upload your ZIP to the root folder (above public_html) using Hostinger File Manager and extract it.', 
      icon: Copy 
    },
    { 
      title: 'Manual .env Setup', 
      desc: 'Rename .env.example to .env. Manually edit DB credentials and set APP_ENV=production via hPanel editor.', 
      icon: FileCode 
    },
    { 
      title: 'Public Folder Fix', 
      desc: 'Move contents of the "public" folder to "public_html". Update index.php paths to point back to "../vendor/autoload.php".', 
      icon: Globe 
    },
    { 
      title: 'Permissions', 
      desc: 'In File Manager, ensure "storage" and "bootstrap/cache" folders are writable (Permission 775 or 755).', 
      icon: CheckCircle2 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">System Architecture: Content & Auth</h2>
          <p className="opacity-70 max-w-2xl">Full backend specifications for a dynamic preparation tracker. Includes relational tables for videos and practice tests.</p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <Server className="w-48 h-48" />
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
        <button 
          onClick={() => setActiveSubTab('logic')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'logic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Code className="w-4 h-4" /> Logic
        </button>
        <button 
          onClick={() => setActiveSubTab('sql')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'sql' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Database className="w-4 h-4" /> SQL Schema
        </button>
        <button 
          onClick={() => setActiveSubTab('deploy')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'deploy' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Rocket className="w-4 h-4" /> Shared Hosting Deployment
        </button>
      </div>

      {activeSubTab === 'logic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {logicSnippets.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono text-sm font-bold text-slate-700">{s.title}</span>
                </div>
                <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                   <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-indigo-300 overflow-x-auto text-xs font-mono leading-relaxed h-72 custom-scrollbar">
                <code>{s.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'sql' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-700">Database Schema (MySQL)</span>
            </div>
            <button className="text-xs text-indigo-600 font-bold hover:underline">Download .sql</button>
          </div>
          <pre className="p-6 bg-slate-950 text-emerald-400 overflow-x-auto text-xs font-mono leading-relaxed max-h-[600px] custom-scrollbar">
            <code>{sqlScript}</code>
          </pre>
        </div>
      )}

      {activeSubTab === 'deploy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deploymentSteps.map((step, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <step.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaravelReference;
