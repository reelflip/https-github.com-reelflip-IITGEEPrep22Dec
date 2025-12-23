
import React, { useState } from 'react';
import { 
  Code, Server, Database, Lock, Shield, Rocket, Copy, Terminal, 
  CheckCircle2, Globe, FileCode, Cpu, Users, Key, FileJson, 
  Activity, Settings, Box, Zap, ShieldAlert, Archive,
  Info, ShieldCheck, Layers, GitBranch, Share2, ChevronRight,
  HardDrive, MonitorSmartphone, KeyRound, Globe2, Download, Loader2
} from 'lucide-react';

declare var JSZip: any;
declare var saveAs: any;

const LaravelReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'router' | 'bootstrap' | 'services' | 'sql' | 'htaccess'>('sql');
  const [isZipping, setIsZipping] = useState(false);

  const phpFiles = {
    router: {
      path: 'index.php',
      title: 'api/index.php',
      icon: GitBranch,
      desc: 'The Entry Point. Now handles complex relational fetches like bringing notes and videos together.',
      code: `<?php
require_once 'Core/Bootstrap.php';

$path = $_GET['path'] ?? 'status';
$data = json_decode(file_get_contents("php://input"), true) ?? [];

switch ($path) {
    case 'status':
        echo json_encode(["system" => "IITGEE_API_ACTIVE", "engine" => "Relational_V2"]);
        break;

    case 'tracker/full-data':
        Middleware::auth(); 
        // Fetches chapters + user progress + videos in one optimized service call
        TrackerService::getDashboardData();
        break;

    case 'auth/login':
        AuthService::login($data);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
}
?>`
    },
    bootstrap: {
      path: 'Core/Bootstrap.php',
      title: 'api/Core/Bootstrap.php',
      icon: Zap,
      desc: 'Database Connection Singleton with strict UTF8MB4 support for math symbols in notes.',
      code: `<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$db_config = [
    'host' => 'localhost',
    'name' => 'u123_jee_mastery',
    'user' => 'u123_admin',
    'pass' => 'P@ssw0rd123!'
];

try {
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['name']};charset=utf8mb4",
        $db_config['user'],
        $db_config['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode(["error" => "Critical: Connection Failed"]));
}

spl_autoload_register(function ($class) {
    $path = __DIR__ . '/../Services/' . $class . '.php';
    if (file_exists($path)) require_once $path;
});`
    },
    services: {
      path: 'Services/TrackerService.php',
      title: 'api/Services/TrackerService.php',
      icon: Layers,
      desc: 'Logic layer that joins the Master Chapter data with Student Progress data.',
      code: `<?php
class TrackerService {
    /**
     * Fetches all chapters joined with user-specific progress
     */
    public static function getDashboardData() {
        global $pdo;
        $user_id = $_SESSION['user_id'];

        $sql = "SELECT c.*, p.status, p.confidence, p.time_spent_mins 
                FROM chapters c
                LEFT JOIN user_progress p ON c.id = p.chapter_id AND p.user_id = ?
                ORDER BY c.subject, c.id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $chapters = $stmt->fetchAll();

        // Include relational data for each chapter
        foreach($chapters as &$ch) {
            $ch['videos'] = self::getVideos($ch['id']);
            $ch['question_count'] = self::getQuestionCount($ch['id']);
        }

        echo json_encode($chapters);
    }

    private static function getVideos($chapter_id) {
        global $pdo;
        $stmt = $pdo->prepare("SELECT title, url FROM video_links WHERE chapter_id = ?");
        $stmt->execute([$chapter_id]);
        return $stmt->fetchAll();
    }
}
?>`
    },
    sql: {
      path: 'schema.sql',
      title: 'Master Relational Schema (SQL)',
      icon: Database,
      desc: 'The complete 7-table architecture. This handles everything from curriculum notes to quiz attempts.',
      code: `-- 1. USER ACCOUNTS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. MASTER CURRICULUM (Where NOTES are stored)
CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    notes LONGTEXT, -- Stores the long-form study material
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. VIDEO TUTORIAL LIBRARY
CREATE TABLE IF NOT EXISTS video_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. MASTER QUESTION BANK
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL, -- Stores ['A','B','C','D']
    correct_answer INT NOT NULL, -- 0-3
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. STUDENT PROGRESS (Pivot Table)
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Not Started',
    confidence INT DEFAULT 0,
    time_spent_mins INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. QUIZ PERFORMANCE LOGS
CREATE TABLE IF NOT EXISTS test_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;`
    },
    htaccess: {
      path: '.htaccess',
      title: 'api/.htaccess',
      icon: FileCode,
      desc: 'Enables clean URLs for your API.',
      code: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?path=$1 [QSA,L]`
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Root Files
      zip.file("index.php", phpFiles.router.code);
      zip.file(".htaccess", phpFiles.htaccess.code);
      zip.file("schema_full.sql", phpFiles.sql.code);
      
      // Core Folder
      const core = zip.folder("Core");
      core.file("Bootstrap.php", phpFiles.bootstrap.code);
      core.file("Middleware.php", `<?php
class Middleware {
    public static function auth() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            die(json_encode(["error" => "Auth required"]));
        }
    }
}
?>`);
      
      // Services Folder
      const services = zip.folder("Services");
      services.file("AuthService.php", `<?php
class AuthService {
    public static function login($data) {
        global $pdo;
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        if ($user && password_verify($data['password'], $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(["status" => "success", "user" => ["id" => $user['id'], "name" => $user['full_name']]]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid Login"]);
        }
    }
}
?>`);
      services.file("TrackerService.php", phpFiles.services.code);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "iitgee_full_backend.zip");
      alert("Relational Backend ZIP generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error generating ZIP.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black text-white p-12 rounded-[3.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
             <div className="bg-indigo-500 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-500/20"><Database className="w-7 h-7" /></div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 block mb-1">Architecture Specification</span>
                <h2 className="text-4xl font-black tracking-tighter">Relational Storage Engine</h2>
             </div>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed mb-10">
            Notes, Videos, and Questions are stored in independent tables linked by <strong>foreign keys</strong>. This ensures your database remains fast even with thousands of students.
          </p>
          <button 
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-4 bg-white text-slate-900 px-10 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
          >
            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isZipping ? 'Packaging Full Engine...' : 'Download Full Relational Backend (.ZIP)'}
          </button>
        </div>
        <div className="absolute -right-20 -top-20 opacity-5 rotate-12">
          <Activity className="w-[30rem] h-[30rem]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Relational Integrity
              </h3>
              <ul className="space-y-6">
                {[
                  { t: 'The Chapters Table', d: 'Stores the core curriculum. All study notes live in the LONGTEXT "notes" column here.' },
                  { t: 'Normalized Videos', d: 'Stored in a separate table. You can add 100+ videos per chapter without bloat.' },
                  { t: 'JSON Questions', d: 'Question options are stored as a JSON array for modern flexibility.' },
                  { t: 'Progress Pivot', d: 'Links Users to Chapters. This is where status and confidence are calculated.' },
                  { t: 'Atomic Attempts', d: 'Every quiz result is a unique row in test_attempts for deep analytics.' },
                ].map((step, i) => (
                  <li key={i} className="group flex gap-4">
                     <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        {i+1}
                     </div>
                     <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight mb-1">{step.t}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{step.d}</p>
                     </div>
                  </li>
                ))}
              </ul>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="flex flex-wrap gap-2 p-2 bg-slate-100/50 rounded-3xl w-fit border border-slate-200">
             {(['sql', 'router', 'services', 'bootstrap', 'htaccess'] as const).map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveSubTab(tab)}
                 className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
               >
                 {React.createElement(phpFiles[tab as keyof typeof phpFiles].icon, { className: "w-3.5 h-3.5" })} {tab === 'sql' ? 'Full Schema' : tab}
               </button>
             ))}
           </div>

           <div className="bg-[#020617] rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
              <div className="bg-slate-900/80 px-10 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-2 rounded-full bg-rose-500/50"></div>
                    <div className="w-3 h-2 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-2 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <span className="font-mono text-xs text-slate-500 border-l border-slate-800 pl-4">{phpFiles[activeSubTab as keyof typeof phpFiles].title}</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(phpFiles[activeSubTab as keyof typeof phpFiles].code)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <pre className="p-10 text-indigo-200 font-mono text-sm leading-relaxed overflow-x-auto max-h-[600px] custom-scrollbar bg-transparent">
                <code>{phpFiles[activeSubTab as keyof typeof phpFiles].code}</code>
              </pre>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LaravelReference;
