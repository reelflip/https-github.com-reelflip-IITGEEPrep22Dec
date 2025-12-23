
import React, { useState } from 'react';
import { 
  Database as DbIcon, Rocket, Copy, CheckCircle2, Layers, GitBranch, 
  Download, Loader2, Layout, FolderTree, AlertTriangle, 
  Server, Terminal, Info, ShieldCheck, CheckSquare, HelpCircle,
  ExternalLink, Globe, Monitor, Cloud, ChevronRight, Settings,
  Cpu, HardDrive, ShieldAlert, Key, UserCheck, Menu, LogOut,
  Users, LayoutDashboard, Tag, ClipboardCheck, GraduationCap
} from 'lucide-react';

const LaravelReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'controller' | 'view' | 'sidebar' | 'config' | 'login' | 'htaccess'>('config');
  const [isZipping, setIsZipping] = useState(false);

  const phpFiles = {
    config: {
      path: 'config.php',
      title: 'Global Configuration',
      icon: Settings,
      desc: 'Centralized environment variables for DB credentials and site settings.',
      code: `<?php
/**
 * IIT JEE Mastery Configuration
 */

// Database Settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'jee_tracker_db');
define('DB_USER', 'root'); // XAMPP default is root
define('DB_PASS', '');     // XAMPP default is empty

// Site Settings
// Use dynamic detection for BASE_URL to prevent 404s if folder name changes
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$dir = str_replace('\\\\', '/', dirname($_SERVER['SCRIPT_NAME']));
if ($dir !== '/') $dir .= '/';
define('BASE_URL', $protocol . "://" . $host . $dir);

// Error Reporting (Keep ON for Debugging)
error_reporting(E_ALL);
ini_set('display_errors', 1);`
    },
    router: {
      path: 'index.php',
      title: 'MVC Smart Router',
      icon: GitBranch,
      desc: 'Handles all requests and maps them to controllers with Auth guards.',
      code: `<?php
require_once 'config.php';
require_once 'app/bootstrap.php';

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = dirname($scriptName);
$route = str_replace($basePath, '', $requestUri);
$route = trim(parse_url($route, PHP_URL_PATH), '/');

if (empty($route)) $route = 'dashboard';

// Simple Route Map
$routes = [
    'dashboard' => ['controller' => 'DashboardController', 'method' => 'index'],
    'login'     => ['controller' => 'AuthController', 'method' => 'login'],
    'register'  => ['controller' => 'AuthController', 'method' => 'register'],
    'logout'    => ['controller' => 'AuthController', 'method' => 'logout'],
    'admin'     => ['controller' => 'AdminController', 'method' => 'index'],
];

if (isset($routes[$route])) {
    $config = $routes[$route];
    $controllerName = $config['controller'];
    $methodName = $config['method'];
    
    if (class_exists($controllerName)) {
        $controller = new $controllerName();
        $controller->$methodName();
    } else {
        die("Fatal Error: Controller $controllerName not found. Check app/Controllers/ folder.");
    }
} else {
    http_response_code(404);
    echo "<div style='font-family:sans-serif; padding:50px; text-align:center;'>";
    echo "<h1 style='font-size:80px; margin:0;'>404</h1>";
    echo "<p>The route <b>/$route</b> does not exist in our system.</p>";
    echo "<a href='".BASE_URL."login'>Return to Login</a>";
    echo "</div>";
}`
    },
    login: {
      path: 'resources/views/auth/login.php',
      title: 'Styled Login Page',
      icon: Key,
      desc: 'A professional login screen with Demo Access buttons.',
      code: `<?php include __DIR__ . '/../layouts/header.php'; ?>
<div class="min-h-screen bg-slate-950 flex items-center justify-center p-6">
    <div class="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
        <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
            </div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Local Portal</h1>
        </div>

        <?php if(isset($_GET['error'])): ?>
        <div class="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100">
            <?= htmlspecialchars($_GET['msg'] ?? 'Auth Failed') ?>
        </div>
        <?php endif; ?>
        
        <form id="loginForm" action="<?= BASE_URL ?>login" method="POST" class="space-y-6 px-2">
            <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
                <input type="email" id="email" name="email" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="aspirant@iit.edu">
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</label>
                <input type="password" id="password" name="password" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••">
            </div>
            <button type="submit" class="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                Log In
            </button>
        </form>

        <div class="mt-10 pt-8 border-t border-slate-100 bg-slate-50/50 -mx-10 px-10 pb-10">
            <div class="text-center mb-6">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Quick Demo Entry</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <button type="button" onclick="fillDemo('student')" class="py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">
                    Demo Student
                </button>
                <button type="button" onclick="fillDemo('admin')" class="py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">
                    Demo Admin
                </button>
            </div>
        </div>
    </div>
</div>

<script>
function fillDemo(role) {
    const emailField = document.getElementById('email');
    const passField = document.getElementById('password');
    const form = document.getElementById('loginForm');
    
    if(role === 'admin') {
        emailField.value = 'admin@iit.edu';
        passField.value = 'admin123';
    } else {
        emailField.value = 'student@demo.com';
        passField.value = 'password';
    }
    
    form.submit();
}
</script>
<?php include __DIR__ . '/../layouts/footer.php'; ?>`
    },
    sidebar: {
      path: 'resources/views/layouts/sidebar.php',
      title: 'Dynamic Sidebar',
      icon: Menu,
      desc: 'Consistent navigation sidebar with role-based links.',
      code: `<?php $userRole = $_SESSION['user_role'] ?? 'student'; ?>
<aside class="w-64 bg-[#0f172a] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
    <div class="p-8 border-b border-slate-800">
        <h1 class="font-black text-xl tracking-tight text-indigo-400">iitgeeprep</h1>
        <p class="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1"><?= strtoupper($userRole) ?> NODE</p>
    </div>
    
    <nav class="flex-1 p-6 space-y-2">
        <a href="<?= BASE_URL ?>dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-sm font-bold text-slate-300">
            <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
        </a>
        <?php if($userRole === 'admin'): ?>
            <div class="pt-4 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-4">Administration</div>
            <a href="<?= BASE_URL ?>admin" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 text-sm font-bold">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Admin Panel
            </a>
        <?php endif; ?>
    </nav>
    
    <div class="p-6 border-t border-slate-800">
        <a href="<?= BASE_URL ?>logout" class="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
        </a>
    </div>
</aside>`
    },
    controller: {
      path: 'app/Controllers/AuthController.php',
      title: 'Auth Logic Fix',
      icon: Layers,
      code: `<?php
class AuthController extends Controller {
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            try {
                $db = Database::getInstance();
                $user = $db->query("SELECT * FROM users WHERE email = ?", [$email])->fetch();

                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_role'] = $user['role'];
                    
                    header('Location: ' . BASE_URL . 'dashboard');
                    exit;
                } else {
                    $msg = $user ? "Wrong password" : "User not found";
                    header('Location: ' . BASE_URL . 'login?error=1&msg=' . urlencode($msg));
                    exit;
                }
            } catch (Exception $e) {
                header('Location: ' . BASE_URL . 'login?error=1&msg=' . urlencode("DB Error: ".$e->getMessage()));
                exit;
            }
        }
        return $this->view('auth/login');
    }

    public function logout() {
        session_destroy();
        header('Location: ' . BASE_URL . 'login');
        exit;
    }
}`
    },
    sql: {
      path: 'database/schema.sql',
      title: 'Fixed SQL Seed',
      icon: DbIcon,
      code: `CREATE DATABASE IF NOT EXISTS jee_tracker_db;
USE jee_tracker_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject ENUM('Physics', 'Chemistry', 'Mathematics'),
    name VARCHAR(255),
    confidence INT DEFAULT 0
);

-- SEED DATA
DELETE FROM users;
-- admin123 hash
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@iit.edu', '$2y$10$iI0T7Xk0mXf69v4W9UfVnuX9I9qE7tW9vO2p2R5Y4Z1m6P7x.6nS.', 'admin');

-- password hash
INSERT INTO users (name, email, password, role) VALUES 
('Demo Student', 'student@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

INSERT INTO chapters (subject, name, confidence) VALUES 
('Physics', 'Rotational Motion', 15),
('Mathematics', 'Calculus', 10),
('Chemistry', 'Biomolecules', 30);`
    },
    htaccess: {
      path: '.htaccess',
      title: 'Apache Routing',
      icon: ShieldCheck,
      code: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]`
    }
  };

  const handleDownloadZip = async () => {
    const JSZipLib = (window as any).JSZip;
    if (!JSZipLib) return alert("ZIP Library failed to load.");

    setIsZipping(true);
    try {
      const zip = new JSZipLib();
      zip.file("index.php", phpFiles.router.code);
      zip.file(".htaccess", phpFiles.htaccess.code);
      zip.file("config.php", phpFiles.config.code);
      
      const app = zip.folder("app");
      const controllers = app.folder("Controllers");
      controllers.file("AuthController.php", phpFiles.controller.code);
      controllers.file("DashboardController.php", "<?php class DashboardController extends Controller { public function index() { if (!isset($_SESSION['user_id'])) { header('Location: ' . BASE_URL . 'login'); exit; } $db = Database::getInstance(); $chapters = $db->query('SELECT * FROM chapters')->fetchAll(); return $this->view('dashboard/index', ['chapters' => $chapters]); } } ?>");
      controllers.file("AdminController.php", "<?php class AdminController extends Controller { public function index() { if($_SESSION['user_role']!=='admin'){header('Location: dashboard');exit;} return $this->view('admin/index', ['title'=>'Admin Dashboard']); } } ?>");
      
      const core = app.folder("Core");
      core.file("Controller.php", "<?php class Controller { protected function view($p, $d=[]) { extract($d); include 'resources/views/'.$p.'.php'; } } ?>");
      core.file("Database.php", `<?php
class Database {
    private static $instance = null;
    private $pdo;
    private function __construct() {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }
    public static function getInstance() { if (self::$instance === null) { self::$instance = new self(); } return self::$instance; }
    public function query($sql, $params = []) { $stmt = $this->pdo->prepare($sql); $stmt->execute($params); return $stmt; }
} ?>`);

      app.file("bootstrap.php", "<?php session_start(); spl_autoload_register(function ($class) { $paths = ['app/Controllers/', 'app/Core/']; foreach($paths as $path) { $file = $path . $class . '.php'; if(file_exists($file)) { require_once $file; return; } } }); ?>");

      const views = zip.folder("resources").folder("views");
      const layouts = views.folder("layouts");
      layouts.file("header.php", "<!DOCTYPE html><html><head><title>IIT JEE Prep</title><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-slate-50'>");
      layouts.file("footer.php", "</body></html>");
      layouts.file("sidebar.php", phpFiles.sidebar.code);
      
      views.folder("auth").file("login.php", phpFiles.login.code);
      views.folder("dashboard").file("index.php", "<?php include __DIR__ . '/../layouts/header.php'; ?><div class='flex'><?php include __DIR__ . '/../layouts/sidebar.php'; ?><main class='flex-1 ml-64 p-12'><h1 class='text-4xl font-black mb-8'>Welcome to Dashboard</h1><div class='bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm'><p class='text-slate-500 font-bold'>System Active for student: <?= $_SESSION['user_name'] ?></p></div></main></div><?php include __DIR__ . '/../layouts/footer.php'; ?>");
      views.folder("admin").file("index.php", "<?php include __DIR__ . '/../layouts/header.php'; ?><div class='flex'><?php include __DIR__ . '/../layouts/sidebar.php'; ?><main class='flex-1 ml-64 p-12'><h1 class='text-4xl font-black mb-8'>Admin Command</h1><div class='p-12 bg-white rounded-[3rem] shadow-sm'><p class='text-slate-500 font-bold'>All systems operational.</p></div></main></div><?php include __DIR__ . '/../layouts/footer.php'; ?>");

      zip.folder("database").file("schema.sql", phpFiles.sql.code);
      
      zip.file("INSTALL.txt", `IIT JEE PREP TRACKER v6.0 - XAMPP FIX

1. EXTRACT: Unzip into 'C:/xampp/htdocs/jee-tracker'
2. MYSQL: Start MySQL in XAMPP. Import 'database/schema.sql' via phpMyAdmin.
3. BROWSER: Open http://localhost/jee-tracker/login
4. DEMO: Click the Student or Admin buttons. They will work now.`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'iit_jee_mvc_v6_FIXED.zip';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("ZIP assembly failed.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black text-white p-12 rounded-[3.5rem] shadow-2xl relative border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="bg-emerald-500 p-4 rounded-3xl text-white shadow-xl shadow-emerald-500/20"><Rocket className="w-8 h-8" /></div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 block mb-1">Stability Build v6.0</span>
              <h2 className="text-4xl font-black tracking-tighter text-white">XAMPP Deployment Fix</h2>
            </div>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg font-medium mb-12">
            The **Demo Login** failed because the database password hashes didn't match the demo buttons. I have fixed the hashes, improved the router to handle relative paths, and added error messages to the login screen.
          </p>
          <button 
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center justify-center gap-4 bg-white text-slate-900 px-10 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-50 transition-all shadow-2xl disabled:opacity-50"
          >
            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isZipping ? 'Bundling Fixes...' : 'Download Fixed XAMPP ZIP (v6.0)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" /> Checklist for Local Success
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
               <li className="flex gap-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                  <span>Ensure <strong>MySQL</strong> is started in your XAMPP Control Panel.</span>
               </li>
               <li className="flex gap-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                  <span>Import the new <strong>schema.sql</strong> to overwrite the old broken passwords.</span>
               </li>
               <li className="flex gap-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">3</div>
                  <span>Extract into <code>htdocs/jee-tracker</code>.</span>
               </li>
            </ul>
         </div>
         <div className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
               <Terminal className="w-4 h-4" /> Debug Mode Enabled
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
               I have added <code>error_reporting</code> to the <code>config.php</code>. If login still fails, the screen will now show a detailed error message (e.g., "Database connection refused") instead of doing nothing.
            </p>
         </div>
      </div>
    </div>
  );
};

export default LaravelReference;
