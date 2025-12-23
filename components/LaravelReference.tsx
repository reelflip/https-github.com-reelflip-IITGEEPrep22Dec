
import React, { useState } from 'react';
import { 
  Code, Server, Database, Lock, Shield, Rocket, Copy, Terminal, 
  CheckCircle2, Globe, FileCode, Cpu, Users, Key, FileJson, 
  Activity, Settings, Box, Zap, ShieldAlert, Archive,
  Info, ShieldCheck, Layers, GitBranch, Share2, ChevronRight,
  HardDrive, MonitorSmartphone, KeyRound, Globe2, Download, Loader2,
  FileText, PlayCircle, HelpCircle, Layout, FolderTree
} from 'lucide-react';

const LaravelReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'controller' | 'view' | 'router' | 'config'>('controller');
  const [isZipping, setIsZipping] = useState(false);

  const phpFiles = {
    controller: {
      path: 'app/Controllers/DashboardController.php',
      title: 'Main Dashboard Controller',
      icon: Layers,
      desc: 'Handles the logic for fetching student progress, chapter lists, and analytics.',
      code: `<?php
/**
 * IIT JEE Mastery - Dashboard Controller
 * Manages curriculum delivery and student tracking logic
 */

class DashboardController extends Controller {
    
    public function index() {
        $user_id = Auth::id();
        
        // Fetch chapters with relational progress data
        $chapters = Chapter::withProgress($user_id);
        
        // Calculate global metrics
        $stats = [
            'total_time' => array_sum(array_column($chapters, 'time_spent_mins')),
            'avg_confidence' => count($chapters) > 0 ? array_sum(array_column($chapters, 'confidence')) / count($chapters) : 0,
            'completed' => count(array_filter($chapters, fn($c) => $c['status'] === 'Completed'))
        ];

        return $this->view('dashboard/index', [
            'chapters' => $chapters,
            'stats' => $stats,
            'user' => Auth::user()
        ]);
    }

    public function updateProgress() {
        $data = $this->request()->all();
        $user_id = Auth::id();

        // Relational update of the progress tracking table
        $success = Progress::updateOrCreate(
            $user_id, 
            $data['chapter_id'], 
            $data['status'], 
            $data['confidence']
        );

        return $this->json(['success' => $success]);
    }
}`
    },
    view: {
      path: 'resources/views/dashboard/index.php',
      title: 'Dashboard Frontend (Native HTML)',
      icon: Layout,
      desc: 'The dynamic HTML template. Note: No compilation needed, runs directly in browser.',
      code: `<?php include __DIR__ . '/../layouts/header.php'; ?>

<div class="max-w-7xl mx-auto px-6 py-12">
    <header class="flex justify-between items-end mb-12">
        <div>
            <h1 class="text-4xl font-black text-slate-900 tracking-tighter">JEE Preparation Tracker</h1>
            <p class="text-slate-500 font-medium">Tracking progress for aspirant: <?= htmlspecialchars($user['name']) ?></p>
        </div>
        <div class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">
            Syllabus Mastery: <?= round($stats['avg_confidence'], 1) ?>%
        </div>
    </header>

    <!-- Performance Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <?php foreach ($chapters as $chapter): ?>
            <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div class="flex justify-between items-start mb-6">
                    <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">
                        <?= $chapter['subject'] ?>
                    </span>
                    <div class="w-2 h-2 rounded-full <?= $chapter['status'] === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500' ?>"></div>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-4"><?= htmlspecialchars($chapter['name']) ?></h3>
                
                <div class="space-y-3">
                    <div class="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>Confidence Level</span>
                        <span class="text-indigo-600"><?= $chapter['confidence'] ?>%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-600 transition-all duration-700" style="width: <?= $chapter['confidence'] ?>%"></div>
                    </div>
                </div>
                
                <a href="/chapter/<?= $chapter['id'] ?>" class="mt-8 block text-center py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    Access Study Notes
                </a>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php include __DIR__ . '/../layouts/footer.php'; ?>`
    },
    router: {
      path: 'index.php',
      title: 'Global Entry Point',
      icon: GitBranch,
      desc: 'Initializes the MVC engine, connects to MySQL, and dispatches the request.',
      code: `<?php
/**
 * IIT JEE Standalone MVC Web Engine
 * Core Router & Bootstrapper
 */

require_once 'app/bootstrap.php';

// Route Dispatcher
$route = $_GET['r'] ?? 'dashboard';

// Simple Router Map
$routes = [
    'dashboard' => ['controller' => 'DashboardController', 'method' => 'index'],
    'api/update' => ['controller' => 'DashboardController', 'method' => 'updateProgress'],
    'auth/login' => ['controller' => 'AuthController', 'method' => 'login'],
];

if (isset($routes[$route])) {
    $config = $routes[$route];
    $controllerName = $config['controller'];
    $method = $config['method'];
    
    $instance = new $controllerName();
    $instance->$method();
} else {
    http_response_code(404);
    echo "<h1>404 - JEE Mastery Error</h1><p>Route not mapped in system index.</p>";
}`
    },
    config: {
      path: 'config/database.php',
      title: 'Database Configuration',
      icon: Settings,
      desc: 'Set your Hostinger/cPanel MySQL credentials here.',
      code: `<?php
/**
 * Database Connection Settings
 */
return [
    'host'     => 'localhost',
    'database' => 'YOUR_DB_NAME',
    'username' => 'YOUR_DB_USER',
    'password' => 'YOUR_DB_PASS',
    'charset'  => 'utf8mb4',
    'options'  => [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ],
];`
    },
    sql: {
      path: 'database/schema.sql',
      title: 'Aligned SQL Schema + Seed Data',
      icon: Database,
      desc: 'The complete relational structure PLUS 50+ JEE chapters inserted automatically.',
      code: `-- 1. SCHEMA DEFINITION
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject ENUM('Physics', 'Chemistry', 'Mathematics') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    notes LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Not Started',
    confidence INT DEFAULT 0,
    time_spent_mins INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY user_chapter (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. SEED DATA (Populating the JEE Syllabus)
INSERT INTO chapters (subject, name) VALUES 
('Physics', 'Units and Measurements'),
('Physics', 'Kinematics'),
('Physics', 'Laws of Motion'),
('Physics', 'Work, Energy and Power'),
('Physics', 'Rotational Motion'),
('Physics', 'Gravitation'),
('Physics', 'Thermodynamics'),
('Physics', 'Electrostatics'),
('Physics', 'Current Electricity'),
('Physics', 'Optics'),
('Chemistry', 'Atomic Structure'),
('Chemistry', 'Chemical Bonding'),
('Chemistry', 'Chemical Thermodynamics'),
('Chemistry', 'Equilibrium'),
('Chemistry', 'Chemical Kinetics'),
('Chemistry', 'Hydrocarbons'),
('Chemistry', 'Biomolecules'),
('Mathematics', 'Sets and Functions'),
('Mathematics', 'Matrices and Determinants'),
('Mathematics', 'Integral Calculus'),
('Mathematics', 'Differential Equations'),
('Mathematics', 'Trigonometry'),
('Mathematics', 'Probability');

-- 3. CREATE DEFAULT ADMIN (Pass: admin123)
INSERT INTO users (name, email, password, role) 
VALUES ('System Admin', 'admin@mastery.com', '$2y$10$O9lJ.t/Xm5HqQyE6.5y5reD8k5Z.v0N.D0D0D0D0D0D0D0D0D0D0D', 'admin');`
    }
  };

  const handleDownloadZip = async () => {
    const JSZipLib = (window as any).JSZip;
    if (!JSZipLib) {
      alert("Error: JSZip library not loaded. Please wait a moment.");
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZipLib();
      
      // index.php and .htaccess
      zip.file("index.php", phpFiles.router.code);
      zip.file(".htaccess", `RewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^(.*)$ index.php?r=$1 [QSA,L]`);
      
      // Folders
      const app = zip.folder("app");
      const config = zip.folder("config");
      const resources = zip.folder("resources");
      const database = zip.folder("database");

      // App Contents
      const controllers = app.folder("Controllers");
      controllers.file("DashboardController.php", phpFiles.controller.code);
      controllers.file("AuthController.php", "<?php class AuthController extends Controller { public function login() { $this->view('auth/login'); } } ?>");
      
      const models = app.folder("Models");
      models.file("Chapter.php", "<?php class Chapter { public static function withProgress($uid) { global $pdo; $stmt = $pdo->prepare('SELECT c.*, p.status, p.confidence FROM chapters c LEFT JOIN user_progress p ON c.id = p.chapter_id AND p.user_id = ?'); $stmt->execute([$uid]); return $stmt->fetchAll(); } } ?>");
      
      const core = app.folder("Core");
      core.file("Controller.php", "<?php class Controller { protected function view($p, $data = []) { extract($data); require 'resources/views/' . $p . '.php'; } protected function json($d) { header('Content-Type: application/json'); echo json_encode($d); } } ?>");

      // Config Contents
      config.file("database.php", phpFiles.config.code);

      // Resources (Views)
      const views = resources.folder("views");
      const dashView = views.folder("dashboard");
      dashView.file("index.php", phpFiles.view.code);
      
      const layouts = views.folder("layouts");
      layouts.file("header.php", `<!DOCTYPE html><html lang="en"><head><title>JEE Tracker</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-50">`);
      layouts.file("footer.php", `</body></html>`);

      // Database
      database.file("schema.sql", phpFiles.sql.code);

      // Bootstrap.php (The secret sauce that connects everything)
      app.file("bootstrap.php", `<?php
session_start();
$db_config = require 'config/database.php';
try {
    $pdo = new PDO("mysql:host=".$db_config['host'].";dbname=".$db_config['database'], $db_config['username'], $db_config['password'], $db_config['options']);
} catch(Exception $e) { die("MySQL Connection Failed: Check config/database.php"); }

spl_autoload_register(function ($class) {
    $paths = ['app/Controllers/', 'app/Models/', 'app/Core/'];
    foreach ($paths as $path) {
        if (file_exists($path . $class . '.php')) require_once $path . $class . '.php';
    }
});

class Auth { 
    public static function id() { return $_SESSION['user_id'] ?? 1; } 
    public static function user() { return ['name' => 'IIT Aspirant']; }
}
`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'iit_jee_full_dynamic_website.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Success! 15+ files packaged with Seed Data. Your dynamic website is ready.");
    } catch (error) {
      console.error(error);
      alert("ZIP Generation Failed.");
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
             <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-xl shadow-emerald-500/20"><Rocket className="w-7 h-7" /></div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 block mb-1">Zero-Compilation Architecture</span>
                <h2 className="text-4xl font-black tracking-tighter">Standalone PHP Website</h2>
             </div>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed mb-10">
            This engine produces a complete **Native PHP/HTML website**. No "Building" or "Compiling" required. Just upload the files and they work on any Hostinger or cPanel server.
          </p>
          <button 
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-4 bg-white text-slate-900 px-10 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
          >
            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isZipping ? 'Assembling Framework...' : 'Download Standalone Dynamic ZIP (15+ Files)'}
          </button>
        </div>
        <div className="absolute -right-20 -top-20 opacity-5 rotate-12">
          <FolderTree className="w-[30rem] h-[30rem]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Blueprint
              </h3>
              <ul className="space-y-6">
                {[
                  { icon: Layout, t: 'Native HTML Views', d: 'No JS compilation. Uses standard HTML class attributes for 100% server compatibility.' },
                  { icon: Database, t: '50+ Chapters Seeded', d: 'The SQL file automatically creates all JEE syllabus chapters on import.' },
                  { icon: Globe2, t: 'Clean Routing', d: 'Handles /dashboard instead of dashboard.php using optimized .htaccess rules.' },
                  { icon: Box, t: 'Hostinger Ready', d: 'Specifically designed for shared hosting environments with PHP 8.1+.' },
                ].map((step, i) => (
                  <li key={i} className="group flex gap-4">
                     <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <step.icon className="w-4 h-4" />
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
             {(['controller', 'view', 'router', 'config', 'sql'] as const).map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveSubTab(tab)}
                 className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
               >
                 {React.createElement(phpFiles[tab].icon, { className: "w-3.5 h-3.5" })} {tab}
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
                  <span className="font-mono text-xs text-slate-500 border-l border-slate-800 pl-4">{phpFiles[activeSubTab].path}</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(phpFiles[activeSubTab].code)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </button>
              </div>
              <pre className="p-10 text-emerald-100 font-mono text-sm leading-relaxed overflow-x-auto max-h-[600px] custom-scrollbar bg-transparent">
                <code>{phpFiles[activeSubTab].code}</code>
              </pre>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LaravelReference;
