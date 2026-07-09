const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RELEASE = path.join(ROOT, 'release', 'LUX Traffic Management');
const BUNDLE = path.join(ROOT, 'server-bundle.cjs');

console.log('=== Building LUX Traffic Management Portable Package ===\n');

// Step 1: Ensure frontend is built
if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
  console.log('[PRE] Building frontend...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
}

// Step 2: Bundle server.js with esbuild
console.log('\n[1/4] Bundling server.js...');
execSync(`npx esbuild server.js --bundle --platform=node --outfile=server-bundle.cjs --external:json-server --external:nodemailer --external:multer`, {
  cwd: ROOT, stdio: 'inherit',
});

// No fix needed — server.js handles __dirname internally

// Step 3: Package with pkg
console.log('\n[2/4] Packaging executable...');
if (!fs.existsSync(RELEASE)) fs.mkdirSync(RELEASE, { recursive: true });
execSync(`npx pkg --targets node18-win-x64 server-bundle.cjs --output "${path.join(RELEASE, 'LUX-Traffic-Management.exe')}"`, {
  cwd: ROOT, stdio: 'inherit',
});

// Step 4: Copy assets alongside the exe
console.log('\n[3/4] Copying assets...');

// Copy dist/
const distTarget = path.join(RELEASE, 'dist');
if (!fs.existsSync(distTarget)) fs.mkdirSync(distTarget, { recursive: true });
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.readdirSync(src).forEach(item => {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  });
}
copyDir(path.join(ROOT, 'dist'), distTarget);

// Copy db.json as initial data
const dataTarget = path.join(RELEASE, 'data');
if (!fs.existsSync(dataTarget)) fs.mkdirSync(dataTarget, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'db.json'), path.join(dataTarget, 'db.json'));

// Create uploads dir
const uploadsTarget = path.join(RELEASE, 'uploads');
if (!fs.existsSync(uploadsTarget)) fs.mkdirSync(uploadsTarget, { recursive: true });
fs.writeFileSync(path.join(uploadsTarget, '.gitkeep'), '');

// Step 5: Cleanup
console.log('\n[4/4] Cleaning up...');
if (fs.existsSync(BUNDLE)) fs.unlinkSync(BUNDLE);

console.log('\n=== Done! ===');
console.log(`Package created at: ${RELEASE}`);
console.log(`\nTo run:`);
console.log(`  1. Open the "LUX Traffic Management" folder`);
console.log(`  2. Double-click LUX-Traffic-Management.exe`);
console.log(`  3. Open http://localhost:3001 in your browser\n`);
