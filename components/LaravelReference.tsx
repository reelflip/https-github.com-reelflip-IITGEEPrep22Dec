
import React, { useState } from 'react';
import { 
  Download, Loader2, Rocket, ShieldCheck, Database, Menu, LayoutDashboard, 
  BrainCircuit, GraduationCap, CheckCircle, Info, Settings, AlertTriangle,
  Users, Tag, ClipboardCheck, Code2, Globe, Activity, Edit3, Eye, PlayCircle, Lock, UserPlus, Server, Terminal, Layers, Package, Cpu, Zap
} from 'lucide-react';

const LaravelReference: React.FC = () => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    const JSZipLib = (window as any).JSZip;
    if (!JSZipLib) return alert("JSZip library not found.");
    setIsZipping(true);

    try {
      const zip = new JSZipLib();

      // 1. ROOT CONFIG
      zip.file("package.json", JSON.stringify({
        "name": "iit-jee-prep-xampp",
        "private": true,
        "version": "18.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "^19.2.3",
          "react-dom": "^19.2.3",
          "recharts": "^3.6.0",
          "lucide-react": "^0.562.0",
          "@google/genai": "^1.34.0"
        },
        "devDependencies": {
          "@types/react": "^19.2.3",
          "@types/react-dom": "^19.2.3",
          "@vitejs/plugin-react": "^4.3.4",
          "autoprefixer": "^10.4.19",
          "postcss": "^8.4.38",
          "tailwindcss": "^3.4.3",
          "typescript": "^5.4.5",
          "vite": "^5.2.11"
        }
      }, null, 2));

      zip.file("vite.config.ts", `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost/iitgeeprep'
    }
  }
});`);

      // 2. BACKEND ENGINE (api.php)
      zip.file("api.php", `<?php
/**
 * TITANIUM API BRIDGE v18.0
 * Decoupled PHP/MySQL Interface for React
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'jee_tracker_db');
define('DB_USER', 'root');
define('DB_PASS', '');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    echo json_encode(['error' => 'MySQL Connectivity Error']); exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$request = trim($_SERVER['REQUEST_URI'], '/');
$parts = explode('/', $request);
// In XAMPP, usually /iitgeeprep/api/resource
$resource = end($parts);
if (strpos($resource, '?') !== false) $resource = explode('?', $resource)[0];

$input = json_decode(file_get_contents('php://input'), true);

switch ($resource) {
    case 'login':
        if ($method === 'POST') {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            $user = $stmt->fetch();
            if ($user && password_verify($input['password'], $user['password'])) {
                unset($user['password']);
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid Credentials']);
            }
        }
        break;

    case 'chapters':
        if ($method === 'GET') {
            $userId = $_GET['userId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM chapters WHERE userId = ? OR userId IS NULL");
            $stmt->execute([$userId]);
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'PUT') {
            $id = end($parts);
            // Dynamic update logic
            $fields = []; $values = [];
            foreach($input as $k => $v) { $fields[] = "$k = ?"; $values[] = $v; }
            $values[] = $id;
            $stmt = $pdo->prepare("UPDATE chapters SET ".implode(', ', $fields)." WHERE id = ?");
            $stmt->execute($values);
            echo json_encode(['success' => true]);
        }
        break;

    case 'questions':
        if ($method === 'GET') {
            echo json_encode($pdo->query("SELECT * FROM questions")->fetchAll());
        } elseif ($method === 'POST') {
            $stmt = $pdo->prepare("INSERT INTO questions (subject, chapterId, text, options, correctAnswer) VALUES (?,?,?,?,?)");
            $stmt->execute([$input['subject'], $input['chapterId'], $input['text'], json_encode($input['options']), $input['correctAnswer']]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
        }
        break;

    case 'tests':
        if ($method === 'GET') {
            $userId = $_GET['userId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM mock_tests WHERE userId = ? ORDER BY date DESC");
            $stmt->execute([$userId]);
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $stmt = $pdo->prepare("INSERT INTO mock_tests (userId, name, physicsScore, chemistryScore, mathsScore, totalScore, outOf) VALUES (?,?,?,?,?,?,?)");
            $stmt->execute([$input['userId'], $input['name'], $input['physicsScore'], $input['chemistryScore'], $input['mathsScore'], $input['totalScore'], $input['outOf']]);
            echo json_encode(['success' => true]);
        }
        break;

    default:
        echo json_encode(['status' => 'Relational API Node Active', 'timestamp' => time()]);
        break;
} `);

      // 3. SEEDER (setup.php)
      zip.file("setup.php", `<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'jee_tracker_db');

try {
    $pdo = new PDO("mysql:host=".DB_HOST, DB_USER, DB_PASS);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS ".DB_NAME);
    $pdo->exec("USE ".DB_NAME);

    $pdo->exec("DROP TABLE IF EXISTS mock_tests, questions, chapters, users");

    $pdo->exec("CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(100), 
        email VARCHAR(100) UNIQUE, 
        password VARCHAR(255), 
        role ENUM('student', 'admin'), 
        joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE chapters (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        userId INT NULL, 
        subject VARCHAR(50), 
        name VARCHAR(255), 
        status VARCHAR(50) DEFAULT 'Not Started', 
        confidence INT DEFAULT 0, 
        notes TEXT NULL
    )");

    $pdo->exec("CREATE TABLE questions (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        chapterId INT NULL, 
        subject VARCHAR(50), 
        text TEXT, 
        options TEXT, 
        correctAnswer INT
    )");

    $pdo->exec("CREATE TABLE mock_tests (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        userId INT, 
        name VARCHAR(255), 
        physicsScore INT, 
        chemistryScore INT, 
        mathsScore INT, 
        totalScore INT, 
        outOf INT, 
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pass = password_hash('admin123', PASSWORD_BCRYPT);
    $pdo->exec("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@iit.edu', '$pass', 'admin')");

    echo "<h1>SYNC SUCCESSFUL</h1><p>Database ".DB_NAME." is now online. Log in with admin@iit.edu / admin123</p>";
} catch (Exception $e) { die($e->getMessage()); } ?>`);

      // 4. ROUTING (.htaccess)
      zip.file(".htaccess", `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api.php [L,QSA]
RewriteRule ^$ dist/index.html [L]
RewriteRule ^(dashboard|subjects|tests|planner|mentor|admin-.*)$ dist/index.html [L]`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'iit_jee_seamless_xampp.zip';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert("Deployment Generation Failure: " + e.message); } finally { setIsZipping(false); }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black text-white p-16 rounded-[4rem] shadow-2xl relative border border-white/5 overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl rotate-3 inline-block mb-10"><Zap className="w-16 h-16 fill-white" /></div>
          <h2 className="text-7xl font-black tracking-tighter mb-8 uppercase">XAMPP Seamless v18</h2>
          <p className="text-slate-400 max-w-3xl mx-auto text-2xl font-medium leading-relaxed mb-16">
            Optimized for production. Run <b>npm run build</b> to generate the JS/CSS bundle, then deploy the <b>api.php</b> to activate the MySQL cluster.
          </p>
          
          <button 
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center justify-center gap-6 bg-white text-slate-900 px-20 py-10 rounded-[4rem] font-black uppercase text-lg tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {isZipping ? <Loader2 className="w-8 h-8 animate-spin text-indigo-500" /> : <Download className="w-8 h-8 text-indigo-500" />}
            {isZipping ? 'Deploying Nodes...' : 'Download Seamless XAMPP Build'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[5rem] p-20 text-white space-y-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12"><Terminal size={300} /></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-black mb-12">Deployment Checklist</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="bg-black/30 p-10 rounded-[3rem] border border-white/10 space-y-6">
              <p className="text-indigo-400 font-black uppercase text-xs tracking-widest">Local Build Step</p>
              <div className="font-mono text-sm text-slate-400 space-y-2">
                <p>1. npm install</p>
                <p>2. npm run build</p>
                <p>3. Move dist/ to xampp/htdocs/iitgeeprep/</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black shrink-0">A</div>
                <p className="text-slate-400">Run <b>setup.php</b> once to initialize the MySQL schema.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black shrink-0">B</div>
                <p className="text-slate-400">Toggle <b>"Live Mode"</b> in the Admin Panel to switch from LocalStorage to MySQL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaravelReference;
